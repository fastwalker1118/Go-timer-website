from flask import Blueprint, request, jsonify, session
from src.models.user import db, Game
from src.models.move_history import MoveHistory
import uuid
from datetime import datetime

move_bp = Blueprint('move', __name__)

@move_bp.route('/games/new', methods=['POST'])
def create_new_game():
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        
        data = request.get_json()
        game_id = str(uuid.uuid4())
        
        # For registered users, save game to database
        if not session.get('is_guest', False):
            game = Game(
                id=game_id,
                user_id=session['user_id'],
                main_time=data.get('main_time', 600),  # default 10 minutes
                byoyomi_time=data.get('byoyomi_time', 30),  # default 30 seconds
                byoyomi_periods=data.get('byoyomi_periods', 3),  # default 3 periods
                status='active'
            )
            
            db.session.add(game)
            db.session.commit()
        
        return jsonify({'game_id': game_id}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create game'}), 500

@move_bp.route('/games/<game_id>/moves', methods=['POST'])
def save_move(game_id):
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Don't save moves for guest users
        if session.get('is_guest', False):
            return jsonify({'message': 'Move not saved (guest mode)'}), 200
        
        data = request.get_json()
        
        if not data or not all(k in data for k in ('move_number', 'player_color', 'time_taken')):
            return jsonify({'error': 'Missing required move data'}), 400
        
        move = MoveHistory(
            user_id=session['user_id'],
            game_id=game_id,
            move_number=data['move_number'],
            player_color=data['player_color'],
            time_taken=data['time_taken'],
            main_time_remaining=data.get('main_time_remaining', 0),
            byoyomi_time_remaining=data.get('byoyomi_time_remaining', 0),
            byoyomi_periods_remaining=data.get('byoyomi_periods_remaining', 0),
            in_byoyomi=data.get('in_byoyomi', False)
        )
        
        db.session.add(move)
        db.session.commit()
        
        return jsonify({'message': 'Move saved successfully'}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to save move'}), 500

@move_bp.route('/games/<game_id>/moves', methods=['GET'])
def get_game_moves(game_id):
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Return empty array for guest users
        if session.get('is_guest', False):
            return jsonify([])
        
        moves = MoveHistory.query.filter_by(
            user_id=session['user_id'],
            game_id=game_id
        ).order_by(MoveHistory.move_number).all()
        
        return jsonify([move.to_dict() for move in moves])
        
    except Exception as e:
        return jsonify({'error': 'Failed to get moves'}), 500

@move_bp.route('/games/<game_id>/complete', methods=['POST'])
def complete_game(game_id):
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Don't update games for guest users
        if session.get('is_guest', False):
            return jsonify({'message': 'Game not updated (guest mode)'}), 200
        
        data = request.get_json()
        
        game = Game.query.filter_by(
            id=game_id,
            user_id=session['user_id']
        ).first()
        
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        game.status = 'completed'
        game.winner = data.get('winner')  # 'white', 'black', or None for draw
        game.completed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Game completed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to complete game'}), 500

@move_bp.route('/games', methods=['GET'])
def get_user_games():
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Return empty array for guest users
        if session.get('is_guest', False):
            return jsonify([])
        
        # Get games for the user, ordered by creation date (newest first)
        games = Game.query.filter_by(
            user_id=session['user_id']
        ).order_by(Game.created_at.desc()).limit(20).all()
        
        return jsonify([game.to_dict() for game in games])
        
    except Exception as e:
        return jsonify({'error': 'Failed to get games'}), 500

@move_bp.route('/games/<game_id>', methods=['GET'])
def get_game_details(game_id):
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Return empty object for guest users
        if session.get('is_guest', False):
            return jsonify({})
        
        game = Game.query.filter_by(
            id=game_id,
            user_id=session['user_id']
        ).first()
        
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        game_data = game.to_dict()
        
        # Include move history
        moves = MoveHistory.query.filter_by(
            game_id=game_id,
            user_id=session['user_id']
        ).order_by(MoveHistory.move_number).all()
        
        game_data['moves'] = [move.to_dict() for move in moves]
        
        return jsonify(game_data)
        
    except Exception as e:
        return jsonify({'error': 'Failed to get game details'}), 500

@move_bp.route('/stats', methods=['GET'])
def get_user_stats():
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Return empty stats for guest users
        if session.get('is_guest', False):
            return jsonify({
                'total_games': 0,
                'completed_games': 0,
                'total_moves': 0,
                'average_move_time': 0,
                'wins_as_white': 0,
                'wins_as_black': 0
            })
        
        # Calculate user statistics
        total_games = Game.query.filter_by(user_id=session['user_id']).count()
        completed_games = Game.query.filter_by(
            user_id=session['user_id'],
            status='completed'
        ).count()
        
        total_moves = MoveHistory.query.filter_by(user_id=session['user_id']).count()
        
        # Calculate average move time
        avg_time_result = db.session.query(
            db.func.avg(MoveHistory.time_taken)
        ).filter_by(user_id=session['user_id']).scalar()
        
        average_move_time = round(avg_time_result, 2) if avg_time_result else 0
        
        # Count wins
        wins_as_white = Game.query.filter_by(
            user_id=session['user_id'],
            winner='white'
        ).count()
        
        wins_as_black = Game.query.filter_by(
            user_id=session['user_id'],
            winner='black'
        ).count()
        
        return jsonify({
            'total_games': total_games,
            'completed_games': completed_games,
            'total_moves': total_moves,
            'average_move_time': average_move_time,
            'wins_as_white': wins_as_white,
            'wins_as_black': wins_as_black
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to get stats'}), 500


@move_bp.route('/games/save', methods=['POST'])
def save_game():
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Don't save games for guest users to backend
        if session.get('is_guest', False):
            return jsonify({'message': 'Game not saved (guest mode)'}), 200
        
        data = request.get_json()
        
        if not data or not data.get('title'):
            return jsonify({'error': 'Game title is required'}), 400
        
        # Create or update game record
        game_id = data.get('gameId') or str(uuid.uuid4())
        
        game = Game.query.filter_by(
            id=game_id,
            user_id=session['user_id']
        ).first()
        
        if not game:
            # Create new game
            game = Game(
                id=game_id,
                user_id=session['user_id'],
                main_time=data.get('settings', {}).get('mainTime', 600),
                byoyomi_time=data.get('settings', {}).get('byoyomiTime', 30),
                byoyomi_periods=data.get('settings', {}).get('byoyomiPeriods', 3),
                status='saved'
            )
            db.session.add(game)
        
        # Update game details
        game.title = data['title']
        game.comment = data.get('comment', '')
        game.status = 'saved'
        game.saved_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Game saved successfully',
            'game_id': game_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to save game'}), 500

