"use client"
import { getMockInterviewDetailsAndAttempts } from '@/api/operations/mock-interview-api';
import { MockInterviewDetailData } from '@/components/attempt-card';
import MockInterviewDetail from '@/components/mock-interview-detail';
import { useAuthStore } from '@/stores/auth-store';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const page = () => {
	const params = useParams();
	const mock_job_id = params.mock_job_id?.[0] as string;

  const { token } = useAuthStore();

  const [mockInterviewDetailData, setMockInterviewDetailData] = useState<MockInterviewDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMockInterviewDetailsAndAttempts = async () => {
      setIsLoading(true);
      const response = await getMockInterviewDetailsAndAttempts(token, mock_job_id);
      if (response?.success) {
        setMockInterviewDetailData(response?.data);
      } else {
        toast.error(response?.message);
      }
      setIsLoading(false);
    }
    fetchMockInterviewDetailsAndAttempts();
  }, [token, mock_job_id]);

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : mockInterviewDetailData ? (
        <MockInterviewDetail mockInterviewDetailData={mockInterviewDetailData} />
      ) : (
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Failed to load mock interview details</p>
            <p className="text-sm text-muted-foreground mt-2">Please try refreshing the page</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default page
