import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

// Components
import Layout from '../components/Layout';
import { Spinner } from '../components/ui/Spinner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { toast } from 'react-hot-toast';

// Types
interface LabSet {
  id: string;
  created_at: string;
  demographics: {
    age: number;
    sex: string;
  };
  context?: {
    reason?: string;
  };
}

// Initialize Supabase client (using public key, RLS will handle auth)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [labSets, setLabSets] = useState<LabSet[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch lab sets when the component mounts
  useEffect(() => {
    async function fetchLabSets() {
      if (status !== 'authenticated') return;
      
      try {
        setLoading(true);
        
        // Fetch lab sets from Supabase
        const { data, error } = await supabase
          .from('lab_sets')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setLabSets(data || []);
      } catch (error) {
        console.error('Error fetching lab sets:', error);
        toast.error('Failed to load your lab results');
      } finally {
        setLoading(false);
      }
    }
    
    fetchLabSets();
  }, [status]);
  
  // Function to view a specific lab set
  const viewLabSet = async (labSetId: string) => {
    router.push(`/results?id=${labSetId}`);
  };

  // Show loading state while fetching session
  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  // Show message if not authenticated
  if (status === 'unauthenticated') {
    return (
      <Layout>
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="mb-6">You need to be signed in to view your lab results.</p>
          <Button onClick={() => router.push('/login')}>Sign In</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Your Lab Results</h1>
          <Button onClick={() => router.push('/upload')}>Upload New Labs</Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : labSets.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">No Lab Results Found</h2>
            <p className="mb-6">You haven't uploaded any lab results yet. Get started by uploading your first lab report.</p>
            <Button onClick={() => router.push('/upload')}>Upload Labs</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labSets.map((labSet) => (
              <Card key={labSet.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Lab Results
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(labSet.created_at), 'PPP')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Age:</span>
                      <span>{labSet.demographics.age}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sex:</span>
                      <span>{labSet.demographics.sex}</span>
                    </div>
                    {labSet.context?.reason && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Reason:</span>
                        <span>{labSet.context.reason}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => viewLabSet(labSet.id)}
                    className="w-full"
                  >
                    View Results
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
