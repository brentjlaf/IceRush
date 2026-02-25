<?php

declare(strict_types=1);

final class HockeyGMSimulator
{
    private string $dbPath;
    private array $state;

    public function __construct(string $dbPath)
    {
        $this->dbPath = $dbPath;
        $raw = file_get_contents($dbPath);

        if ($raw === false) {
            throw new RuntimeException('Unable to read database file.');
        }

        $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        $this->state = is_array($decoded) ? $decoded : [];
    }

    public function getState(): array
    {
        return $this->state;
    }

    public function draftProspect(string $teamId, string $prospectId): string
    {
        $teamIndex = $this->findTeamIndex($teamId);
        $prospectIndex = $this->findProspectIndex($prospectId);

        if ($teamIndex === null || $prospectIndex === null) {
            return 'Draft failed: team or prospect not found.';
        }

        $team = &$this->state['league']['teams'][$teamIndex];
        $prospect = $this->state['league']['prospects'][$prospectIndex];

        if (($team['salary_cap_used'] + $prospect['salary']) > $team['salary_cap_limit']) {
            return 'Draft failed: salary cap exceeded.';
        }

        $team['roster'][] = $prospect;
        $team['salary_cap_used'] += $prospect['salary'];
        array_splice($this->state['league']['prospects'], $prospectIndex, 1);

        $this->persist();

        return sprintf('%s drafted by %s.', $prospect['name'], $team['name']);
    }

    public function tradePlayer(string $fromTeamId, string $toTeamId, string $playerId): string
    {
        if ($fromTeamId === $toTeamId) {
            return 'Trade failed: teams must be different.';
        }

        $fromTeamIndex = $this->findTeamIndex($fromTeamId);
        $toTeamIndex = $this->findTeamIndex($toTeamId);

        if ($fromTeamIndex === null || $toTeamIndex === null) {
            return 'Trade failed: one or both teams not found.';
        }

        $fromTeam = &$this->state['league']['teams'][$fromTeamIndex];
        $toTeam = &$this->state['league']['teams'][$toTeamIndex];
        $playerIndex = $this->findPlayerIndex($fromTeam, $playerId);

        if ($playerIndex === null) {
            return 'Trade failed: player not found on source roster.';
        }

        $player = $fromTeam['roster'][$playerIndex];

        if (($toTeam['salary_cap_used'] + $player['salary']) > $toTeam['salary_cap_limit']) {
            return 'Trade failed: destination team would exceed cap.';
        }

        array_splice($fromTeam['roster'], $playerIndex, 1);
        $fromTeam['salary_cap_used'] -= $player['salary'];
        $toTeam['roster'][] = $player;
        $toTeam['salary_cap_used'] += $player['salary'];

        $this->persist();

        return sprintf('%s traded from %s to %s.', $player['name'], $fromTeam['name'], $toTeam['name']);
    }

    public function simulateGame(string $homeTeamId, string $awayTeamId): array
    {
        if ($homeTeamId === $awayTeamId) {
            return ['summary' => 'Simulation failed: pick two different teams.', 'play_by_play' => []];
        }

        $homeTeam = $this->getTeam($homeTeamId);
        $awayTeam = $this->getTeam($awayTeamId);

        if ($homeTeam === null || $awayTeam === null) {
            return ['summary' => 'Simulation failed: team not found.', 'play_by_play' => []];
        }

        $homePower = $this->teamPower($homeTeam) + random_int(0, 10);
        $awayPower = $this->teamPower($awayTeam) + random_int(0, 10);
        $homeScore = intdiv($homePower, 25);
        $awayScore = intdiv($awayPower, 25);

        $playByPlay = [];
        for ($period = 1; $period <= 3; $period++) {
            $eventCount = random_int(2, 4);
            for ($i = 0; $i < $eventCount; $i++) {
                $minute = random_int(1, 20);
                $eventTeam = random_int(0, 1) === 0 ? $homeTeam : $awayTeam;
                $star = $eventTeam['roster'][array_rand($eventTeam['roster'])];
                $playByPlay[] = sprintf('P%s %02d:%02d - %s creates a scoring chance (%s).', (string) $period, $minute, random_int(0, 59), $star['name'], implode(', ', $star['traits']));
            }
        }

        $summary = sprintf('%s %d - %d %s', $awayTeam['name'], $awayScore, $homeScore, $homeTeam['name']);

        $this->state['league']['games'][] = [
            'week' => $this->state['league']['week'],
            'home' => $homeTeam['name'],
            'away' => $awayTeam['name'],
            'home_score' => $homeScore,
            'away_score' => $awayScore,
            'play_by_play' => $playByPlay,
        ];

        $this->persist();

        return ['summary' => $summary, 'play_by_play' => $playByPlay];
    }

    public function advanceWeekDevelopment(): string
    {
        $this->state['league']['week']++;

        foreach ($this->state['league']['teams'] as &$team) {
            foreach ($team['roster'] as &$player) {
                $delta = random_int(-2, 3);

                if (in_array('Clutch', $player['traits'], true)) {
                    $delta += 1;
                }

                if (in_array('Injury-prone', $player['traits'], true) && random_int(1, 100) <= 30) {
                    $delta -= 3;
                }

                if (in_array('Locker room leader', $player['traits'], true)) {
                    $delta += 1;
                }

                if (in_array('Dirty player', $player['traits'], true) && random_int(1, 100) <= 15) {
                    $delta -= 1;
                }

                $player['overall'] = max(55, min(99, $player['overall'] + $delta));
            }
            unset($player);
        }
        unset($team);

        $this->persist();

        return 'Advanced one week. Traits influenced player growth.';
    }

    private function teamPower(array $team): int
    {
        $base = 0;
        foreach ($team['roster'] as $player) {
            $bonus = 0;
            if (in_array('Clutch', $player['traits'], true)) {
                $bonus += 3;
            }
            if (in_array('Locker room leader', $player['traits'], true)) {
                $bonus += 2;
            }
            if (in_array('Dirty player', $player['traits'], true)) {
                $bonus += 1;
            }
            if (in_array('Injury-prone', $player['traits'], true)) {
                $bonus -= 2;
            }
            $base += $player['overall'] + $bonus;
        }

        return $base;
    }

    private function getTeam(string $teamId): ?array
    {
        foreach ($this->state['league']['teams'] as $team) {
            if ($team['id'] === $teamId) {
                return $team;
            }
        }

        return null;
    }

    private function findTeamIndex(string $teamId): ?int
    {
        foreach ($this->state['league']['teams'] as $index => $team) {
            if ($team['id'] === $teamId) {
                return $index;
            }
        }

        return null;
    }

    private function findProspectIndex(string $prospectId): ?int
    {
        foreach ($this->state['league']['prospects'] as $index => $prospect) {
            if ($prospect['id'] === $prospectId) {
                return $index;
            }
        }

        return null;
    }

    private function findPlayerIndex(array $team, string $playerId): ?int
    {
        foreach ($team['roster'] as $index => $player) {
            if ($player['id'] === $playerId) {
                return $index;
            }
        }

        return null;
    }

    private function persist(): void
    {
        file_put_contents($this->dbPath, json_encode($this->state, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));
    }
}
