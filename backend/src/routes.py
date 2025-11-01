from flask import Blueprint, jsonify, request, abort
from src.models import db, Task, Comment

bp = Blueprint('api', __name__, url_prefix='/api')

# --- Helper Functions ---

def get_task_or_404(task_id):
    """Get a task by ID, aborting with 404 if not found."""
    # --- FIX for LegacyAPIWarning ---
    task = db.session.get(Task, task_id) 
    if not task:
        abort(404, description=f"Task with id {task_id} not found.")
    return task

def get_comment_or_404(comment_id):
    """Get a comment by ID, aborting with 404 if not found."""
    # --- FIX for LegacyAPIWarning ---
    comment = db.session.get(Comment, comment_id)
    if not comment:
        abort(404, description=f"Comment with id {comment_id} not found.")
    return comment

# --- Task Routes (for context) ---

@bp.route('/tasks', methods=['POST'])
def create_task():
    """Create a new task."""
    data = request.get_json()
    if not data or not 'title' in data:
        abort(400, description="Missing 'title' in request body.")
        
    new_task = Task(title=data['title'], description=data.get('description'))
    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201

@bp.route('/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks."""
    # .all() is fine on the query object for now, or use db.session.scalars()
    tasks = Task.query.all() 
    return jsonify([task.to_dict() for task in tasks]), 200

@bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get a single task by its ID."""
    task = get_task_or_404(task_id)
    return jsonify(task.to_dict()), 200

# --- Comment CRUD Routes (Task #1) ---

@bp.route('/tasks/<int:task_id>/comments', methods=['POST'])
def add_comment(task_id):
    """
    (C)reate: Add a new comment to a specific task.
    """
    # Ensure the task exists
    task = get_task_or_404(task_id)
    
    data = request.get_json()
    if not data or not 'content' in data:
        abort(400, description="Missing 'content' in request body.")
        
    content = data['content'].strip()
    if not content:
        abort(400, description="'content' cannot be empty.")

    # Create and save the new comment
    new_comment = Comment(content=content, task_id=task.id)
    db.session.add(new_comment)
    db.session.commit()
    
    return jsonify(new_comment.to_dict()), 201

@bp.route('/tasks/<int:task_id>/comments', methods=['GET'])
def get_comments_for_task(task_id):
    """
    (R)ead: Get all comments for a specific task.
    """
    # Ensure the task exists
    task = get_task_or_404(task_id)
    
    # Get all comments associated with this task
    comments = Comment.query.filter_by(task_id=task.id).all()
    
    return jsonify([comment.to_dict() for comment in comments]), 200

@bp.route('/comments/<int:comment_id>', methods=['PUT', 'PATCH'])
def edit_comment(comment_id):
    """
    (U)pdate: Edit an existing comment by its ID.
    """
    # Find the comment
    comment = get_comment_or_404(comment_id)
    
    data = request.get_json()
    if not data or not 'content' in data:
        abort(400, description="Missing 'content' in request body.")

    content = data['content'].strip()
    if not content:
        abort(400, description="'content' cannot be empty.")

    # Update the content and commit
    comment.content = content
    db.session.commit()
    
    return jsonify(comment.to_dict()), 200

@bp.route('/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    """
    (D)elete: Delete a comment by its ID.
    """
    # Find the comment
    comment = get_comment_or_404(comment_id)
    
    # Delete and commit
    db.session.delete(comment)
    db.session.commit()
    
    # Return a success message
    return jsonify({'message': f'Comment with id {comment_id} deleted.'}), 200

# --- Error Handlers ---

@bp.app_errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad Request', 'message': error.description}), 400

@bp.app_errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not Found', 'message': error.description}), 404

