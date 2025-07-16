import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bell,
  Send,
  CheckCircle,
  Trash2,
  X,
  AlertCircle,
  Info,
  CheckSquare,
  Square,
  MessageSquare,
  Clock
} from 'lucide-react';

const Notifications = () => {
  const { user } = useAuth();
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messageForm, setMessageForm] = useState({
    subject: '',
    content: '',
    type: 'info'
  });

  useEffect(() => {
    fetchStudents();
    fetchNotifications();
    
    // Poll for new notifications instead of using realtime
    // Initial fetch
    fetchNotifications();
    
    // Set up polling every 30 seconds
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds
    
    return () => {
      clearInterval(pollInterval);
    };

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('register')
      .select('id, first_name, surname, course, user_id')
      .order('first_name');
    
    if (!error && data) {
      setStudents(data);
    }
  };

  const fetchNotifications = async () => {
    if (!user || !user.id || typeof user.id !== 'string' || user.id.length < 10) {
      console.log('fetchNotifications: user or user.id not ready or invalid', user);
      return;
    }
    console.log('fetchNotifications: user.id =', user.id);

    // Fetch user-specific notifications (recipient_id is UUID)
    const { data: userNotifs, error: userError } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false });
    if (userError) {
      console.error('Error fetching user notifications:', userError, userError.message, userError.details, userError.hint, userError.code);
    }

    // Fetch admin-wide notifications (recipient_role is text)
    const { data: adminNotifs, error: adminError } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_role', 'admin')
      .order('created_at', { ascending: false });
    if (adminError) {
      console.error('Error fetching admin notifications:', adminError, adminError.message, adminError.details, adminError.hint, adminError.code);
    }

    // Merge and sort notifications by created_at descending
    const notifications = [...(userNotifs || []), ...(adminNotifs || [])]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setNotifications(notifications);
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleMessageChange = (e) => {
    const { name, value } = e.target;
    setMessageForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    if (!messageForm.subject || !messageForm.content) {
      alert('Please fill in both subject and content');
      return;
    }

    try {
      // Create notifications for each selected student
      const notificationsToCreate = selectedStudents.map(studentId => ({
        type: messageForm.type,
        title: messageForm.subject,
        message: messageForm.content,
        recipient_id: studentId,
        read: false
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notificationsToCreate);

      if (error) throw error;

      // Reset form and refresh notifications
      setMessageForm({ subject: '', content: '', type: 'info' });
      setSelectedStudents([]);
      setShowMessageForm(false);
      fetchNotifications();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', user.id);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      alert('Failed to mark notifications as read');
    }
  };

  const handleClearAll = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('recipient_id', user.id);

      if (error) throw error;
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
      alert('Failed to clear notifications');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
        );
      case 'warning':
        return (
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
        );
      case 'error':
        return (
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-6 h-6 text-red-600" />
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Info className="w-6 h-6 text-blue-600" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-700 dark:text-cyan-400 flex items-center gap-3">
          <Bell className="text-blue-600 dark:text-cyan-300" size={32} /> Notifications
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowMessageForm(!showMessageForm)}
            className="px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors font-semibold flex items-center gap-2 shadow-lg"
          >
            <Send size={18} />
            {showMessageForm ? 'Cancel' : 'Send Message'}
          </button>
          <button 
            onClick={handleMarkAllAsRead}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold flex items-center gap-2 shadow-lg"
          >
            <CheckCircle size={18} />
            Mark all as read
          </button>
          <button 
            onClick={handleClearAll}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 shadow-lg"
          >
            <Trash2 size={18} />
            Clear all
          </button>
        </div>
      </div>

      {/* Message Form */}
      {showMessageForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-blue-700 dark:text-cyan-400 mb-6 flex items-center gap-3">
            <MessageSquare className="text-blue-600 dark:text-cyan-300" size={24} />
            Send Message to Students
          </h2>
          <form onSubmit={handleSendMessage} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Select Students
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                    <input
                      type="checkbox"
                      id={`student-${student.id}`}
                      checked={selectedStudents.includes(student.user_id)}
                      onChange={() => handleStudentSelect(student.user_id)}
                      className="h-5 w-5 text-cyan-600 rounded border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                    <label htmlFor={`student-${student.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      {student.first_name} {student.surname} - {student.course}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Message Type
              </label>
              <select
                name="type"
                value={messageForm.type}
                onChange={handleMessageChange}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="info">Information</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Message Subject
              </label>
              <input
                type="text"
                name="subject"
                value={messageForm.subject}
                onChange={handleMessageChange}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter message subject"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Message Content
              </label>
              <textarea
                name="content"
                value={messageForm.content}
                onChange={handleMessageChange}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows="4"
                placeholder="Type your message here..."
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setShowMessageForm(false)}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors font-semibold flex items-center gap-2"
              >
                <Send size={18} />
                Send Message
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 ${
              !notification.read ? 'ring-2 ring-cyan-500/20 hover:shadow-xl' : 'hover:shadow-lg'
            }`}
          >
            <div className="flex items-start gap-4">
              {getNotificationIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {notification.title}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock size={16} />
                    {new Date(notification.created_at).toLocaleString()}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {notification.message}
                </p>
              </div>
              {!notification.read && (
                <div className="flex-shrink-0">
                  <span className="inline-block w-3 h-3 rounded-full bg-cyan-600 animate-pulse"></span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <Bell className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notifications</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            You're all caught up! Check back later for new notifications.
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;