from src import db
import datetime

class Task(db.Model):
    """
    Task model. We need this to associate comments with.
    """
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationship to comments
    # backref='task' creates a 'task' attribute on the Comment model
    # lazy=True means SQLAlchemy will load the comments as needed
    comments = db.relationship('Comment', backref='task', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        """Serialize Task object to a dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'created_at': self.created_at.isoformat() + 'Z',
            'comment_count': len(self.comments)
        }

class Comment(db.Model):
    """
    Comment model.
    """
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Foreign key to link to the Task model
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)

    def to_dict(self):
        """Serialize Comment object to a dictionary."""
        return {
            'id': self.id,
            'content': self.content,
            'created_at': self.created_at.isoformat() + 'Z',
            'task_id': self.task_id
        }
