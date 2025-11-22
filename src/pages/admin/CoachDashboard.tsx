
import { useState, useEffect } from 'react';

interface CoachProposal {
  id: number;
  title: string;
  proposal_type: string;
  analysis_summary: string;
  sample_size: number;
  confidence_score: number;
  current_behavior: string;
  proposed_behavior: string;
  expected_improvement: string;
  supporting_evaluations: any;
  metrics: any;
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
}

interface SkillCandidate {
  pattern: string;
  count: number;
  avgTau: number;
  evaluationIds: number[];
  sampleInstructions: string[];
}

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'https://vctt-agi-backend.onrender.com';

export default function CoachDashboard() {
  const [proposals, setProposals] = useState<CoachProposal[]>([]);
  const [skillCandidates, setSkillCandidates] = useState<SkillCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'proposals' | 'skills'>('proposals');
  const [selectedProposal, setSelectedProposal] = useState<CoachProposal | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProposals();
    fetchSkillCandidates();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/coach/proposals?status=pending`);
      const data = await response.json();
      setProposals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkillCandidates = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/skills/candidates?minTau=0.85&minCount=3`);
      const data = await response.json();
      setSkillCandidates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch skill candidates:', error);
      setSkillCandidates([]);
    }
  };

  const handleApprove = async (proposalId: number) => {
    setSubmitting(true);
    try {
      await fetch(`${BACKEND_URL}/api/coach/proposals/${proposalId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewedBy: 'admin@vctt-agi.com',
          reviewNotes: reviewNotes || 'Approved for implementation',
        }),
      });
      
      alert('✅ Proposal approved! MIN will implement this improvement.');
      setSelectedProposal(null);
      setReviewNotes('');
      fetchProposals();
    } catch (error) {
      console.error('Failed to approve proposal:', error);
      alert('❌ Failed to approve proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (proposalId: number) => {
    setSubmitting(true);
    try {
      await fetch(`${BACKEND_URL}/api/coach/proposals/${proposalId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewedBy: 'admin@vctt-agi.com',
          reviewNotes: reviewNotes || 'Not aligned with current objectives',
        }),
      });
      
      alert('❌ Proposal rejected.');
      setSelectedProposal(null);
      setReviewNotes('');
      fetchProposals();
    } catch (error) {
      console.error('Failed to reject proposal:', error);
      alert('❌ Failed to reject proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prompt_refinement': return 'bg-blue-500';
      case 'new_skill': return 'bg-green-500';
      case 'heuristic': return 'bg-purple-500';
      case 'tool_enhancement': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prompt_refinement': return '✍️';
      case 'new_skill': return '🎯';
      case 'heuristic': return '🧠';
      case 'tool_enhancement': return '🔧';
      default: return '💡';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Coach Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                🧠 Coach Dashboard
                <span className="text-sm font-normal text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                  Self-Improvement HQ
                </span>
              </h1>
              <p className="text-gray-400 mt-2">
                Review MIN's self-improvement proposals and approve changes that make it smarter.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Pending Proposals</div>
              <div className="text-3xl font-bold text-blue-400">{proposals.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('proposals')}
              className={`py-3 px-4 border-b-2 font-medium transition-colors ${
                activeTab === 'proposals'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              💡 Proposals ({proposals.length})
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`py-3 px-4 border-b-2 font-medium transition-colors ${
                activeTab === 'skills'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              🎯 Skill Candidates ({skillCandidates.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'proposals' && (
          <>
            {proposals.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🌙</div>
                <h3 className="text-xl font-semibold mb-2">No pending proposals</h3>
                <p className="text-gray-400">
                  The Coach runs nightly at 03:00 UTC. Check back tomorrow morning for new insights.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTypeIcon(proposal.proposal_type)}</span>
                        <div>
                          <h3 className="text-lg font-semibold">{proposal.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`${getTypeColor(proposal.proposal_type)} text-white text-xs px-2 py-1 rounded`}>
                              {proposal.proposal_type.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-400">
                              📊 Sample size: {proposal.sample_size} episodes
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">
                          {(proposal.confidence_score * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-400">confidence</div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Summary</div>
                        <p className="text-sm text-gray-300">{proposal.analysis_summary}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Current Behavior</div>
                          <p className="text-sm text-gray-300 bg-red-950 bg-opacity-30 border border-red-900 p-3 rounded">
                            {proposal.current_behavior}
                          </p>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Proposed Behavior</div>
                          <p className="text-sm text-gray-300 bg-green-950 bg-opacity-30 border border-green-900 p-3 rounded">
                            {proposal.proposed_behavior}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Expected Improvement</div>
                        <p className="text-sm text-green-400">{proposal.expected_improvement}</p>
                      </div>

                      {proposal.supporting_evaluations && (
                        <div className="bg-gray-950 border border-gray-800 p-3 rounded">
                          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Supporting Data</div>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <div className="text-gray-400">High-τ Episodes</div>
                              <div className="text-green-400 font-mono">
                                {proposal.supporting_evaluations.high_tau_count} episodes
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-400">Low-τ Episodes</div>
                              <div className="text-red-400 font-mono">
                                {proposal.supporting_evaluations.low_tau_count} episodes
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-400">Avg High τ</div>
                              <div className="text-blue-400 font-mono">
                                {proposal.metrics?.avg_high_tau?.toFixed(2) || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedProposal(proposal)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-medium transition-colors"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProposal(proposal);
                          setReviewNotes('Not aligned with current objectives');
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium transition-colors"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'skills' && (
          <>
            {skillCandidates.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">No skill candidates found</h3>
                <p className="text-gray-400">
                  Skill candidates appear when MIN successfully completes similar tasks 3+ times with high trust scores.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {skillCandidates.map((candidate, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Pattern #{idx + 1}</h3>
                        <p className="text-sm text-gray-400 font-mono">{candidate.pattern}...</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">
                          {(candidate.avgTau * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-400">avg τ</div>
                      </div>
                    </div>

                    <div className="bg-gray-950 border border-gray-800 p-3 rounded mb-4">
                      <div className="text-xs text-gray-400 mb-2">SAMPLE INSTRUCTIONS</div>
                      {(candidate.sampleInstructions || []).map((instr, i) => (
                        <div key={i} className="text-sm text-gray-300 mb-1">
                          • {instr?.substring(0, 150)}...
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        Found in {candidate.count} episodes ({candidate.evaluationIds.length} evaluation IDs)
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors">
                        🎯 Extract as Skill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {getTypeIcon(selectedProposal.proposal_type)} Review Proposal
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{selectedProposal.title}</h3>
                <p className="text-sm text-gray-400">{selectedProposal.analysis_summary}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Review Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm resize-none"
                  rows={4}
                  placeholder="Add your review notes (optional)..."
                />
              </div>

              <div className="bg-yellow-950 bg-opacity-30 border border-yellow-900 p-4 rounded">
                <div className="text-yellow-400 text-sm font-medium mb-1">⚠️ Important</div>
                <p className="text-sm text-gray-300">
                  Approved proposals will be queued for implementation. The development team will apply the changes and test them before deploying.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 flex gap-3">
              <button
                onClick={() => {
                  setSelectedProposal(null);
                  setReviewNotes('');
                }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded font-medium transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedProposal.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium transition-colors"
                disabled={submitting}
              >
                {submitting ? 'Processing...' : '❌ Reject'}
              </button>
              <button
                onClick={() => handleApprove(selectedProposal.id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-medium transition-colors"
                disabled={submitting}
              >
                {submitting ? 'Processing...' : '✅ Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
