import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiUser, FiCalendar, FiTrash2, FiEdit } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';

// Helper function to construct media URLs
const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads/')) {
    // URL encode the path to handle spaces and special characters
    const encodedPath = encodeURI(path);
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${encodedPath}`;
  }
  return path;
};

const CommentsContainer = styled.div`
  margin-top: 32px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const CommentsHeader = styled.h3`
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CommentForm = styled.form`
  margin-bottom: 32px;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ffd700;
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 12px 24px;
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
  color: #000;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CommentItem = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.1);
  }
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const CommentAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AuthorName = styled.span`
  color: #ffd700;
  font-weight: 600;
  font-size: 14px;
`;

const CommentDate = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled(motion.button)`
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #ffd700;
  }
`;

const CommentText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
`;

const Comments = ({ postId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/comments/post/${postId}`);
        setComments(response.data.comments || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const sanitizedComment = DOMPurify.sanitize(newComment.trim());
    if (!sanitizedComment) {
      toast.error('Invalid comment content');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        text: sanitizedComment
      });
      setComments([response.data, ...comments]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      const response = await api.put(`/posts/${postId}/comments/${commentId}`, {
        text: editText.trim()
      });
      setComments(comments.map(c => 
        c._id === commentId ? response.data : c
      ));
      setEditingId(null);
      setEditText('');
      toast.success('Comment updated');
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const startEditing = (comment) => {
    setEditingId(comment._id);
    setEditText(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  if (loading) {
    return (
      <CommentsContainer>
        <CommentsHeader>Loading comments...</CommentsHeader>
      </CommentsContainer>
    );
  }

  return (
    <CommentsContainer>
      <CommentsHeader>
        Comments ({comments.length})
      </CommentsHeader>

      {isAuthenticated && (
        <CommentForm onSubmit={handleSubmitComment}>
          <CommentTextarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this software..."
            maxLength={1000}
          />
          <SubmitButton
            type="submit"
            disabled={!newComment.trim() || submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiSend size={16} />
            {submitting ? 'Posting...' : 'Post Comment'}
          </SubmitButton>
        </CommentForm>
      )}

      <CommentsList>
        <AnimatePresence>
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <CommentItem
                key={comment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <CommentHeader>
                  <CommentAuthor>
                    {comment.author?.avatar ? (
                      <img 
                        src={getMediaUrl(comment.author.avatar)} 
                        alt={`${comment.author.username}'s avatar`}
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%',
                          border: '2px solid rgba(255, 215, 0, 0.3)',
                          objectFit: 'cover'
                        }} 
                      />
                    ) : (
                      <FiUser 
                        size={32} 
                        style={{ 
                          padding: '8px', 
                          background: 'rgba(255, 215, 0, 0.2)', 
                          borderRadius: '50%',
                          color: '#ffd700'
                        }} 
                      />
                    )}
                    <AuthorInfo>
                      <AuthorName>{comment.author?.username || 'Anonymous'}</AuthorName>
                      <CommentDate>
                        <FiCalendar size={12} />
                        {formatDate(comment.createdAt)}
                      </CommentDate>
                    </AuthorInfo>
                  </CommentAuthor>
                  
                  {user && (user.id === comment.author?._id || user.role === 'admin') && (
                    <CommentActions>
                      <ActionButton
                        onClick={() => startEditing(comment)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiEdit size={14} />
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDeleteComment(comment._id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiTrash2 size={14} />
                      </ActionButton>
                    </CommentActions>
                  )}
                </CommentHeader>

                {editingId === comment._id ? (
                  <div>
                    <CommentTextarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{ marginBottom: '12px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <SubmitButton
                        onClick={() => handleEditComment(comment._id)}
                        style={{ fontSize: '12px', padding: '8px 16px' }}
                      >
                        Save
                      </SubmitButton>
                      <ActionButton onClick={cancelEditing}>
                        Cancel
                      </ActionButton>
                    </div>
                  </div>
                ) : (
                  <CommentText>{comment.content}</CommentText>
                )}
              </CommentItem>
            ))
          ) : (
            <EmptyState>
              {isAuthenticated 
                ? "No comments yet. Be the first to share your thoughts!" 
                : "No comments yet. Login to start the conversation!"
              }
            </EmptyState>
          )}
        </AnimatePresence>
      </CommentsList>
    </CommentsContainer>
  );
};

export default Comments;