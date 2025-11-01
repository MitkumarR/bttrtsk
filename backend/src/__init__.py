from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from src.config import Config, TestingConfig
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    """
    Application factory pattern.
    Creates and configures the Flask application.
    """
    app = Flask(__name__)

    CORS(app)
    
    # Load configuration
    if os.environ.get('FLASK_ENV') == 'testing':
        app.config.from_object(TestingConfig)
    else:
        app.config.from_object(config_class)

    # Initialize extensions with the app
    db.init_app(app)
    migrate.init_app(app, db)

    # Import and register blueprints/routes
    from src import routes
    app.register_blueprint(routes.bp)
    
    # Create database tables if they don't exist
    # This is fine for development, but for production, you'd use migrations
    with app.app_context():
        db.create_all()

    return app
