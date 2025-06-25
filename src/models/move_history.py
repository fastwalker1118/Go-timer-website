from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from .user import db

class MoveHistory(db.Model):
    __tablename__ = 'move_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    game_id = db.Column(db.String(36), db.ForeignKey('games.id'), nullable=False)
    move_number = db.Column(db.Integer, nullable=False)
    player_color = db.Column(db.String(10), nullable=False)  # white or black
    time_taken = db.Column(db.Integer, nullable=False)  # in seconds
    main_time_remaining = db.Column(db.Integer, nullable=False)  # in seconds
    byoyomi_time_remaining = db.Column(db.Integer, nullable=False)  # in seconds
    byoyomi_periods_remaining = db.Column(db.Integer, nullable=False)
    in_byoyomi = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'game_id': self.game_id,
            'move_number': self.move_number,
            'player_color': self.player_color,
            'time_taken': self.time_taken,
            'main_time_remaining': self.main_time_remaining,
            'byoyomi_time_remaining': self.byoyomi_time_remaining,
            'byoyomi_periods_remaining': self.byoyomi_periods_remaining,
            'in_byoyomi': self.in_byoyomi,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

