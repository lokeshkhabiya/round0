"use client";
import { getCandidateData } from '@/api/operations/candidate-api';
import { CandidateDetail, CandidateProfile } from '@/components/candidate-profile';
import { useAuthStore } from '@/stores/auth-store';
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import DetailedReportModal from '@/components/detailed-report-modal';

export default function CandidateProfilePage() {
    const { token } = useAuthStore();
    const params = useParams();
    const candidate_id = params.candidate_id?.[0];
    const router = useRouter();
    const [viewReportModal, setViewReportModal] = useState(false);
    const [selectedRoundId, setSelectedRoundId] = useState<string>('');

    const [candidateData, setCandidateData] = useState<CandidateDetail>()

    const fetchCandidate = async () => {
        const response = await getCandidateData(token as string, candidate_id as string);
        if(!response?.success){
            console.log(response?.message);
            return;
        }else{
            console.log(response?.message);
            setCandidateData(response?.data)
        }
    }

    useEffect(()=>{
        if(token){
            fetchCandidate();
        }
    },[token]);
    

  const handleBack = () => {
    console.log("Going back to candidates list")
    // Navigate back to candidates listing
    router.push("/candidates")
  }


  const handleViewJob = (jobId: string) => {
    console.log(`Viewing job: ${jobId}`)
    router.push(`/jobs/${jobId}`);
  }

  const handleViewRound = (roundId: string, roundNumber: number, roundType: string) => {
    console.log(`Viewing interview round: ${roundId}, Round ${roundNumber}, Type: ${roundType}`)
    setSelectedRoundId(roundId);
    setViewReportModal(true);
  }

  return (
    <>
      <CandidateProfile
        candidate={candidateData!}
        onBack={handleBack}
        onViewJob={handleViewJob}
        onViewRound={handleViewRound}
      />
      
      {/* Render the detailed report modal */}
      {viewReportModal && selectedRoundId && (
        <DetailedReportModal 
          isOpen={viewReportModal}
          setIsViewingDetailedReport={setViewReportModal}
          round_id={selectedRoundId}
        />
      )}
    </>
  )
}
