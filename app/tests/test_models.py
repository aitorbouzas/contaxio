from datetime import datetime, timedelta
from models import Game, Puzzle, Try, PuzzleStatus, GameConfig


def test_puzzle_status_logic():
    puzzle = Puzzle(display_name="Test", topic="topic")
    assert puzzle.status == PuzzleStatus.IDLE

    fail_try = Try(player_uid="123", outcome=PuzzleStatus.FAILED)
    puzzle.tries.append(fail_try)
    assert puzzle.status == PuzzleStatus.FAILED

    success_try = Try(player_uid="123", outcome=PuzzleStatus.SOLVED)
    puzzle.tries.append(success_try)
    assert puzzle.status == PuzzleStatus.SOLVED


def test_game_duration():
    start = datetime.now() - timedelta(minutes=10)
    config = GameConfig(total_players=4, total_impostors=1)

    game = Game(config=config, start_time=start)

    assert 599 <= game.duration_seconds <= 601
