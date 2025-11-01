import pytest
from flask import Flask
from src.models import db, Task, Comment
from src.routes import bp


@pytest.fixture
def app():
    """Create and configure a test Flask application."""
    app = Flask(__name__)
    
    # Test configuration
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # In-memory database
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(bp)
    
    # Create tables
    with app.app_context():
        db.create_all()
        yield app
        # Cleanup
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create a test client for the Flask application."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Create a test CLI runner for the Flask application."""
    return app.test_cli_runner()


@pytest.fixture
def sample_task(app):
    """Create a sample task in the database."""
    with app.app_context():
        task = Task(title="Sample Task", description="This is a sample task")
        db.session.add(task)
        db.session.commit()
        # Refresh to get the ID
        db.session.refresh(task)
        task_id = task.id
        task_data = task.to_dict()
    return task_data


@pytest.fixture
def sample_tasks(app):
    """Create multiple sample tasks in the database."""
    with app.app_context():
        tasks = [
            Task(title="Task 1", description="First task"),
            Task(title="Task 2", description="Second task"),
            Task(title="Task 3", description="Third task")
        ]
        for task in tasks:
            db.session.add(task)
        db.session.commit()
        
        # Get task data
        task_data = [task.to_dict() for task in tasks]
    return task_data


@pytest.fixture
def sample_comment(app, sample_task):
    """Create a sample comment for a task."""
    with app.app_context():
        comment = Comment(
            content="This is a sample comment",
            task_id=sample_task['id']
        )
        db.session.add(comment)
        db.session.commit()
        db.session.refresh(comment)
        comment_data = comment.to_dict()
    return comment_data


@pytest.fixture
def sample_comments(app, sample_task):
    """Create multiple sample comments for a task."""
    with app.app_context():
        comments = [
            Comment(content="First comment", task_id=sample_task['id']),
            Comment(content="Second comment", task_id=sample_task['id']),
            Comment(content="Third comment", task_id=sample_task['id'])
        ]
        for comment in comments:
            db.session.add(comment)
        db.session.commit()
        
        comment_data = [comment.to_dict() for comment in comments]
    return comment_data