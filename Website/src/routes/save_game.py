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

