from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    games = db.relationship('Game', backref='user', lazy=True, cascade='all, delete-orphan')
    move_history = db.relationship('MoveHistory', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Game(db.Model):
    __tablename__ = 'games'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=True)  # Game title
    comment = db.Column(db.Text, nullable=True)  # Game comments
    main_time = db.Column(db.Integer, nullable=False)  # in seconds
    byoyomi_time = db.Column(db.Integer, nullable=False)  # in seconds
    byoyomi_periods = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='active')  # active, completed, abandoned, saved
    winner = db.Column(db.String(10), nullable=True)  # white, black, or null
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    saved_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    moves = db.relationship('MoveHistory', backref='game', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'comment': self.comment,
            'main_time': self.main_time,
            'byoyomi_time': self.byoyomi_time,
            'byoyomi_periods': self.byoyomi_periods,
            'status': self.status,
            'winner': self.winner,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'saved_at': self.saved_at.isoformat() if self.saved_at else None,
            'move_count': len(self.moves) if self.moves else 0
        }

