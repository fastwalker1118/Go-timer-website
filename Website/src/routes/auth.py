from flask import Blueprint, request, jsonify, session
from src.models.user import User, db
from werkzeug.security import check_password_hash, generate_password_hash
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('username', 'email', 'password')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Validate input
        if len(data['username']) < 3:
            return jsonify({'error': 'Username must be at least 3 characters'}), 400
        
        if len(data['password']) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password'])
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Log in the user
        session['user_id'] = user.id
        session['username'] = user.username
        session['is_guest'] = False
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('username', 'password')):
            return jsonify({'error': 'Missing username or password'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if user and check_password_hash(user.password_hash, data['password']):
            session['user_id'] = user.id
            session['username'] = user.username
            session['is_guest'] = False
            
            return jsonify({
                'message': 'Login successful',
                'user': user.to_dict()
            }), 200
        
        return jsonify({'error': 'Invalid username or password'}), 401
        
    except Exception as e:
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/guest', methods=['POST'])
def guest_login():
    try:
        # Create a temporary guest session
        guest_id = str(uuid.uuid4())
        guest_username = f'Guest_{guest_id[:8]}'
        
        session['user_id'] = guest_id
        session['username'] = guest_username
        session['is_guest'] = True
        
        return jsonify({
            'message': 'Guest session created',
            'user': {
                'id': guest_id,
                'username': guest_username,
                'is_guest': True
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to create guest session'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    try:
        session.clear()
        return jsonify({'message': 'Logged out successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Logout failed'}), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        
        user_data = {
            'user_id': session['user_id'],
            'username': session['username'],
            'is_guest': session.get('is_guest', False)
        }
        
        # If not a guest, get additional user info
        if not session.get('is_guest', False):
            user = User.query.get(session['user_id'])
            if user:
                user_data.update(user.to_dict())
        
        return jsonify(user_data), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get user info'}), 500

