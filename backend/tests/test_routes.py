import pytest
import json


# ===========================
# Task Routes Tests
# ===========================

class TestTaskRoutes:
    """Tests for task-related endpoints."""
    
    def test_create_task_success(self, client):
        """Test creating a new task with valid data."""
        response = client.post(
            '/api/tasks',
            data=json.dumps({
                'title': 'New Task',
                'description': 'Task description'
            }),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['title'] == 'New Task'
        assert data['description'] == 'Task description'
        assert 'id' in data
        assert 'created_at' in data
        assert data['comment_count'] == 0
    
    def test_create_task_without_description(self, client):
        """Test creating a task without description."""
        response = client.post(
            '/api/tasks',
            data=json.dumps({'title': 'Task without description'}),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['title'] == 'Task without description'
        assert data['description'] is None
    
    def test_create_task_missing_title(self, client):
        """Test creating a task without title (should fail)."""
        response = client.post(
            '/api/tasks',
            data=json.dumps({'description': 'No title'}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'title' in data['message'].lower()
    
    def test_create_task_empty_body(self, client):
        """Test creating a task with empty body."""
        response = client.post(
            '/api/tasks',
            data=json.dumps({}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
    
    def test_get_all_tasks_empty(self, client):
        """Test getting all tasks when none exist."""
        response = client.get('/api/tasks')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data == []
    
    def test_get_all_tasks(self, client, sample_tasks):
        """Test getting all tasks."""
        response = client.get('/api/tasks')
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 3
        assert data[0]['title'] == 'Task 1'
        assert data[1]['title'] == 'Task 2'
        assert data[2]['title'] == 'Task 3'
    
    def test_get_single_task(self, client, sample_task):
        """Test getting a single task by ID."""
        response = client.get(f'/api/tasks/{sample_task["id"]}')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['id'] == sample_task['id']
        assert data['title'] == sample_task['title']
    
    def test_get_nonexistent_task(self, client):
        """Test getting a task that doesn't exist."""
        response = client.get('/api/tasks/9999')
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert 'not found' in data['message'].lower()


# ===========================
# Comment CRUD Tests
# ===========================

class TestCommentRoutes:
    """Tests for comment-related endpoints."""
    
    # --- CREATE Tests ---
    
    def test_add_comment_success(self, client, sample_task):
        """Test adding a comment to a task."""
        response = client.post(
            f'/api/tasks/{sample_task["id"]}/comments',
            data=json.dumps({'content': 'Great task!'}),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['content'] == 'Great task!'
        assert data['task_id'] == sample_task['id']
        assert 'id' in data
        assert 'created_at' in data
    
    def test_add_comment_to_nonexistent_task(self, client):
        """Test adding a comment to a task that doesn't exist."""
        response = client.post(
            '/api/tasks/9999/comments',
            data=json.dumps({'content': 'Comment'}),
            content_type='application/json'
        )
        
        assert response.status_code == 404
    
    def test_add_comment_missing_content(self, client, sample_task):
        """Test adding a comment without content."""
        response = client.post(
            f'/api/tasks/{sample_task["id"]}/comments',
            data=json.dumps({}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'content' in data['message'].lower()
    
    def test_add_comment_empty_content(self, client, sample_task):
        """Test adding a comment with empty/whitespace content."""
        response = client.post(
            f'/api/tasks/{sample_task["id"]}/comments',
            data=json.dumps({'content': '   '}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'empty' in data['message'].lower()
    
    # --- READ Tests ---
    
    def test_get_comments_empty(self, client, sample_task):
        """Test getting comments when task has none."""
        response = client.get(f'/api/tasks/{sample_task["id"]}/comments')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data == []
    
    def test_get_comments_for_task(self, client, sample_task, sample_comments):
        """Test getting all comments for a task."""
        response = client.get(f'/api/tasks/{sample_task["id"]}/comments')
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 3
        assert data[0]['content'] == 'First comment'
        assert data[1]['content'] == 'Second comment'
        assert data[2]['content'] == 'Third comment'
    
    def test_get_comments_for_nonexistent_task(self, client):
        """Test getting comments for a task that doesn't exist."""
        response = client.get('/api/tasks/9999/comments')
        
        assert response.status_code == 404
    
    # --- UPDATE Tests ---
    
    def test_edit_comment_success_put(self, client, sample_comment):
        """Test editing a comment using PUT method."""
        response = client.put(
            f'/api/comments/{sample_comment["id"]}',
            data=json.dumps({'content': 'Updated comment'}),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['content'] == 'Updated comment'
        assert data['id'] == sample_comment['id']
    
    def test_edit_comment_success_patch(self, client, sample_comment):
        """Test editing a comment using PATCH method."""
        response = client.patch(
            f'/api/comments/{sample_comment["id"]}',
            data=json.dumps({'content': 'Patched comment'}),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['content'] == 'Patched comment'
    
    def test_edit_comment_missing_content(self, client, sample_comment):
        """Test editing a comment without content field."""
        response = client.put(
            f'/api/comments/{sample_comment["id"]}',
            data=json.dumps({}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'content' in data['message'].lower()
    
    def test_edit_comment_empty_content(self, client, sample_comment):
        """Test editing a comment with empty content."""
        response = client.put(
            f'/api/comments/{sample_comment["id"]}',
            data=json.dumps({'content': '  '}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'empty' in data['message'].lower()
    
    def test_edit_nonexistent_comment(self, client):
        """Test editing a comment that doesn't exist."""
        response = client.put(
            '/api/comments/9999',
            data=json.dumps({'content': 'New content'}),
            content_type='application/json'
        )
        
        assert response.status_code == 404
    
    # --- DELETE Tests ---
    
    def test_delete_comment_success(self, client, sample_comment):
        """Test deleting a comment."""
        response = client.delete(f'/api/comments/{sample_comment["id"]}')
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'message' in data
        assert 'deleted' in data['message'].lower()
        
        # Verify comment is actually deleted
        get_response = client.get(
            f'/api/tasks/{sample_comment["task_id"]}/comments'
        )
        comments = get_response.get_json()
        assert len(comments) == 0
    
    def test_delete_nonexistent_comment(self, client):
        """Test deleting a comment that doesn't exist."""
        response = client.delete('/api/comments/9999')
        
        assert response.status_code == 404
    
    def test_delete_comment_multiple_times(self, client, sample_comment):
        """Test deleting the same comment twice."""
        # First delete should succeed
        response1 = client.delete(f'/api/comments/{sample_comment["id"]}')
        assert response1.status_code == 200
        
        # Second delete should fail
        response2 = client.delete(f'/api/comments/{sample_comment["id"]}')
        assert response2.status_code == 404


# ===========================
# Integration Tests
# ===========================

class TestCommentIntegration:
    """Integration tests for comment functionality."""
    
    def test_task_comment_count_increases(self, client, sample_task):
        """Test that task comment_count increases when comments are added."""
        # Add first comment
        client.post(
            f'/api/tasks/{sample_task["id"]}/comments',
            data=json.dumps({'content': 'Comment 1'}),
            content_type='application/json'
        )
        
        # Add second comment
        client.post(
            f'/api/tasks/{sample_task["id"]}/comments',
            data=json.dumps({'content': 'Comment 2'}),
            content_type='application/json'
        )
        
        # Check task has correct comment count
        response = client.get(f'/api/tasks/{sample_task["id"]}')
        task = response.get_json()
        assert task['comment_count'] == 2
    
    def test_task_comment_count_decreases(self, client, sample_task, sample_comments):
        """Test that task comment_count decreases when comments are deleted."""
        # Initial count should be 3
        response = client.get(f'/api/tasks/{sample_task["id"]}')
        task = response.get_json()
        assert task['comment_count'] == 3
        
        # Delete one comment
        client.delete(f'/api/comments/{sample_comments[0]["id"]}')
        
        # Check count decreased
        response = client.get(f'/api/tasks/{sample_task["id"]}')
        task = response.get_json()
        assert task['comment_count'] == 2
    
    def test_full_comment_lifecycle(self, client, sample_task):
        """Test creating, reading, updating, and deleting a comment."""
        # CREATE
        create_response = client.post(
            f'/api/tasks/{sample_task["id"]}/comments',
            data=json.dumps({'content': 'Initial comment'}),
            content_type='application/json'
        )
        assert create_response.status_code == 201
        comment = create_response.get_json()
        comment_id = comment['id']
        
        # READ
        read_response = client.get(f'/api/tasks/{sample_task["id"]}/comments')
        comments = read_response.get_json()
        assert len(comments) == 1
        assert comments[0]['content'] == 'Initial comment'
        
        # UPDATE
        update_response = client.put(
            f'/api/comments/{comment_id}',
            data=json.dumps({'content': 'Updated comment'}),
            content_type='application/json'
        )
        assert update_response.status_code == 200
        updated_comment = update_response.get_json()
        assert updated_comment['content'] == 'Updated comment'
        
        # DELETE
        delete_response = client.delete(f'/api/comments/{comment_id}')
        assert delete_response.status_code == 200
        
        # Verify deletion
        final_response = client.get(f'/api/tasks/{sample_task["id"]}/comments')
        final_comments = final_response.get_json()
        assert len(final_comments) == 0