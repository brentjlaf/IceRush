<?php

declare(strict_types=1);

require_once __DIR__ . '/app.php';

$sim = new HockeyGMSimulator(__DIR__ . '/data/db.json');
$action = $_POST['action'] ?? $_GET['action'] ?? 'dashboard';
$message = '';

switch ($action) {
    case 'draft':
        $prospectId = $_POST['prospect_id'] ?? '';
        $teamId = $_POST['team_id'] ?? '';
        $message = $sim->draftProspect($teamId, $prospectId);
        break;
    case 'trade':
        $fromTeamId = $_POST['from_team_id'] ?? '';
        $toTeamId = $_POST['to_team_id'] ?? '';
        $playerId = $_POST['player_id'] ?? '';
        $message = $sim->tradePlayer($fromTeamId, $toTeamId, $playerId);
        break;
    case 'simulate':
        $homeTeamId = $_POST['home_team_id'] ?? '';
        $awayTeamId = $_POST['away_team_id'] ?? '';
        $result = $sim->simulateGame($homeTeamId, $awayTeamId);
        $message = $result['summary'];
        break;
    case 'advance_week':
        $message = $sim->advanceWeekDevelopment();
        break;
}

$state = $sim->getState();
$teams = $state['league']['teams'];
$prospects = $state['league']['prospects'];
$recentGames = array_slice(array_reverse($state['league']['games']), 0, 5);
$playByPlay = $result['play_by_play'] ?? [];

function esc(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Hockey GM Simulator</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
<main class="container">
    <h1>Hockey GM Simulator</h1>
    <p class="subhead">Low graphics, high strategy. Manage your roster, salary cap, and outcomes.</p>

    <?php if ($message !== ''): ?>
        <div class="alert"><?= esc($message) ?></div>
    <?php endif; ?>

    <section class="panel two-col">
        <div>
            <h2>Draft Prospect</h2>
            <form method="post">
                <input type="hidden" name="action" value="draft">
                <label>Team
                    <select name="team_id" required>
                        <?php foreach ($teams as $team): ?>
                            <option value="<?= esc($team['id']) ?>"><?= esc($team['name']) ?> (Cap <?= (int) $team['salary_cap_used'] ?>/<?= (int) $team['salary_cap_limit'] ?>)</option>
                        <?php endforeach; ?>
                    </select>
                </label>
                <label>Prospect
                    <select name="prospect_id" required>
                        <?php foreach ($prospects as $prospect): ?>
                            <option value="<?= esc($prospect['id']) ?>">
                                <?= esc($prospect['name']) ?> - OVR <?= (int) $prospect['overall'] ?> - $<?= (int) $prospect['salary'] ?>M (<?= esc(implode(', ', $prospect['traits'])) ?>)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </label>
                <button type="submit">Draft</button>
            </form>
        </div>

        <div>
            <h2>Trade Player</h2>
            <form method="post">
                <input type="hidden" name="action" value="trade">
                <label>From Team
                    <select name="from_team_id" required>
                        <?php foreach ($teams as $team): ?>
                            <option value="<?= esc($team['id']) ?>"><?= esc($team['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </label>
                <label>To Team
                    <select name="to_team_id" required>
                        <?php foreach ($teams as $team): ?>
                            <option value="<?= esc($team['id']) ?>"><?= esc($team['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </label>
                <label>Player ID
                    <input type="text" name="player_id" placeholder="e.g. p001" required>
                </label>
                <button type="submit">Execute Trade</button>
            </form>
        </div>
    </section>

    <section class="panel two-col">
        <div>
            <h2>Simulate Game (Text-Based)</h2>
            <form method="post">
                <input type="hidden" name="action" value="simulate">
                <label>Home Team
                    <select name="home_team_id" required>
                        <?php foreach ($teams as $team): ?>
                            <option value="<?= esc($team['id']) ?>"><?= esc($team['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </label>
                <label>Away Team
                    <select name="away_team_id" required>
                        <?php foreach ($teams as $team): ?>
                            <option value="<?= esc($team['id']) ?>"><?= esc($team['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </label>
                <button type="submit">Simulate</button>
            </form>

            <form method="post" class="inline-form">
                <input type="hidden" name="action" value="advance_week">
                <button type="submit">Advance Week (Trait Development)</button>
            </form>
        </div>

        <div>
            <h2>Latest Play-by-Play</h2>
            <ul class="play-log">
                <?php if ($playByPlay === []): ?>
                    <li>No game simulated yet this session.</li>
                <?php else: ?>
                    <?php foreach ($playByPlay as $line): ?>
                        <li><?= esc($line) ?></li>
                    <?php endforeach; ?>
                <?php endif; ?>
            </ul>
        </div>
    </section>

    <section class="panel">
        <h2>Online League Snapshot</h2>
        <p>League: <strong><?= esc($state['league']['name']) ?></strong> • Week <?= (int) $state['league']['week'] ?></p>
        <div class="team-grid">
            <?php foreach ($teams as $team): ?>
                <article class="team-card">
                    <h3><?= esc($team['name']) ?></h3>
                    <p>Cap: <?= (int) $team['salary_cap_used'] ?>/<?= (int) $team['salary_cap_limit'] ?>M</p>
                    <ul>
                        <?php foreach ($team['roster'] as $player): ?>
                            <li>
                                <?= esc($player['name']) ?> (<?= (int) $player['overall'] ?>) - $<?= (int) $player['salary'] ?>M
                                <em><?= esc(implode(', ', $player['traits'])) ?></em>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </article>
            <?php endforeach; ?>
        </div>
    </section>

    <section class="panel">
        <h2>Recent Results</h2>
        <ul>
            <?php foreach ($recentGames as $game): ?>
                <li>Week <?= (int) $game['week'] ?>: <?= esc($game['away']) ?> <?= (int) $game['away_score'] ?> - <?= (int) $game['home_score'] ?> <?= esc($game['home']) ?></li>
            <?php endforeach; ?>
        </ul>
    </section>
</main>
</body>
</html>
