import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FileText, 
  MessageSquare, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  MapPin,
  Building,
  Clock,
  DollarSign,
  Users,
  Target,
  Zap,
  Star,
  ChevronRight,
  User,
  Settings,
  LogOut,
  Bell,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ApplicationModal from './ApplicationModal';
import JobSearchModal from './JobSearchModal';
import JobPreferencesModal from './JobPreferencesModal';
import ProfileModal from './ProfileModal';
import AIEnhancementModal from './AIEnhancementModal';
import AIResumeBuilderModal from './AIResumeBuilderModal';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  setShowModal, 
  setShowJobSearchModal, 
  setShowJobPreferencesModal, 
  setShowProfileModal,
  setEditingApplication 
} from '../../store/dashboardSlice';
import { openModal as openAIModal } from '../../store/aiEnhancementModalSlice';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const dispatch = useAppDispatch();
  
  const { 
    showModal, 
    showJobSearchModal, 
    showJobPreferencesModal, 
    showProfileModal 
  } = useAppSelector(state => state.dashboard);
  
  const { isOpen: showAIModal } = useAppSelector(state => state.aiEnhancementModal);

  // Local state for modals not in Redux
  const [showAIResumeBuilderModal, setShowAIResumeBuilderModal] = useState(false);
  const [applications, setApplications] = useState([
    {
      id: 1,
      company: 'Google',
      position: 'Senior Software Engineer',
      status: 'interview_scheduled',
      appliedDate: '2024-01-15',
      location: 'Mountain View, CA',
      salary: '$180,000 - $250,000',
      type: 'Full-time',
      description: 'We are looking for a Senior Software Engineer to join our team...'
    },
    {
      id: 2,
      company: 'Microsoft',
      position: 'Product Manager',
      status: 'under_review',
      appliedDate: '2024-01-12',
      location: 'Seattle, WA',
      salary: '$150,000 - $200,000',
      type: 'Full-time',
      description: 'Join our product team to drive innovation...'
    },
    {
      id: 3,
      company: 'Apple',
      position: 'iOS Developer',
      status: 'rejected',
      appliedDate: '2024-01-10',
      location: 'Cupertino, CA',
      salary: '$160,000 - $220,000',
      type: 'Full-time',
      description: 'Develop cutting-edge iOS applications...'
    }
  ]);

  const [stats] = useState({
    totalApplications: 24,
    interviewsScheduled: 3,
    responseRate: 68,
    avgResponseTime: 5
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAddApplication = () => {
    dispatch(setEditingApplication(null));
    dispatch(setShowModal(true));
  };

  const handleEditApplication = (application: any) => {
    dispatch(setEditingApplication(application));
    dispatch(setShowModal(true));
  };

  const handleDeleteApplication = (id: number) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interview_scheduled':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'interview_scheduled':
        return <CheckCircle size={16} />;
      case 'under_review':
        return <Clock size={16} />;
      case 'rejected':
        return <XCircle size={16} />;
      case 'applied':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Handle AI Resume Builder Modal
  const handleOpenAIResumeBuilder = () => {
    console.log('Opening AI Resume Builder Modal');
    setShowAIResumeBuilderModal(true);
  };

  // Handle Find Jobs Modal
  const handleOpenJobSearch = () => {
    console.log('Opening Job Search Modal');
    dispatch(setShowJobSearchModal(true));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Job Search Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Bell size={20} />
              </button>
              
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {userProfile?.full_name || user?.email?.split('@')[0] || 'User'}
                  </span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="py-1">
                    <button 
                      onClick={() => dispatch(setShowProfileModal(true))}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User size={16} className="mr-2" />
                      Profile Settings
                    </button>
                    <button 
                      onClick={() => dispatch(setShowJobPreferencesModal(true))}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings size={16} className="mr-2" />
                      Job Preferences
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {userProfile?.full_name || user?.email?.split('@')[0] || 'User'}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your job search progress and recent activity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Interviews Scheduled</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.interviewsScheduled}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.responseRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgResponseTime} days</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Resume & Cover Letter Card */}
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6" />
              </div>
              <Star className="h-5 w-5 text-yellow-300" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Resume & Cover Letter</h3>
            <p className="text-purple-100 text-sm mb-4">
              Generate optimized resumes and cover letters tailored to specific job descriptions using AI.
            </p>
            <button 
              onClick={handleOpenAIResumeBuilder}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Get Started
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Find Jobs Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Find Jobs</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Search and discover new job opportunities that match your skills and preferences.
            </p>
            <button 
              onClick={handleOpenJobSearch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Search Jobs
              <Search size={16} />
            </button>
          </div>

          {/* Mock Interview Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mock Interview</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Practice with AI-powered mock interviews to improve your interview skills.
            </p>
            <button 
              onClick={() => navigate('/ai-interview')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Start Practice
              <MessageSquare size={16} />
            </button>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Applications</h3>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <Filter size={16} />
                </button>
                <button 
                  onClick={handleAddApplication}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus size={16} />
                  Add Application
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Company & Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                            <Building className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {application.position}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {application.company}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        {formatStatus(application.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(application.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MapPin size={14} className="mr-1" />
                        {application.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <DollarSign size={14} className="mr-1" />
                        {application.salary}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleEditApplication(application)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteApplication(application.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showModal && <ApplicationModal />}
      {showJobSearchModal && <JobSearchModal />}
      {showJobPreferencesModal && <JobPreferencesModal />}
      {showProfileModal && <ProfileModal />}
      {showAIModal && <AIEnhancementModal />}
      {showAIResumeBuilderModal && (
        <AIResumeBuilderModal 
          isOpen={showAIResumeBuilderModal}
          onClose={() => setShowAIResumeBuilderModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;