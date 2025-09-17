import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

// Components
import Layout from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { Trash2 } from 'lucide-react';

// Context and Utilities
import { useLaboratoryContext } from '../context/lab-test-context';
import { convertToSI } from '../lib/units';

export default function Review() {
  const router = useRouter();
  const { 
    extractedLabs, 
    reviewedLabs, 
    setReviewedLabs,
    demographics,
    setDemographics
  } = useLaboratoryContext();
  
  const [loading, setLoading] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({
    code: '',
    name: '',
    value: 0,
    unit: '',
    ref_range_low: undefined as number | undefined,
    ref_range_high: undefined as number | undefined,
  });

  // Copy extracted labs to reviewed labs on initial load
  useEffect(() => {
    if (extractedLabs && extractedLabs.length > 0 && (!reviewedLabs || reviewedLabs.length === 0)) {
      setReviewedLabs(extractedLabs);
    }
  }, [extractedLabs, reviewedLabs, setReviewedLabs]);

  // If no labs, redirect to upload
  useEffect(() => {
    if (!extractedLabs || extractedLabs.length === 0) {
      router.push('/upload');
    }
  }, [extractedLabs, router]);

  // Handle demographics form change
  const handleDemographicsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Convert numeric values
    if (type === 'number') {
      setDemographics({
        ...demographics,
        [name]: value ? parseFloat(value) : ''
      });
    } else {
      setDemographics({
        ...demographics,
        [name]: value
      });
    }
  };

  // Handle edit lab value
  const startEdit = (index: number) => {
    const lab = reviewedLabs[index];
    setEditIndex(index);
    setEditValues({
      code: lab.code,
      name: lab.name,
      value: lab.value,
      unit: lab.unit,
      ref_range_low: lab.ref_range_low,
      ref_range_high: lab.ref_range_high,
    });
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditIndex(null);
  };

  // Save edit
  const saveEdit = () => {
    if (editIndex === null) return;
    
    const updatedLabs = [...reviewedLabs];
    
    // Get SI values based on the edited values
    const { value_si, unit_si } = convertToSI(
      editValues.code,
      editValues.value,
      editValues.unit
    );
    
    // Update the lab with both original and SI values
    updatedLabs[editIndex] = {
      ...updatedLabs[editIndex],
      ...editValues,
      value_si,
      unit_si
    };
    
    setReviewedLabs(updatedLabs);
    setEditIndex(null);
    toast.success('Lab value updated');
  };

  // Handle input change in edit form
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Convert numeric values
    if (type === 'number') {
      setEditValues({
        ...editValues,
        [name]: value ? parseFloat(value) : undefined
      });
    } else {
      setEditValues({
        ...editValues,
        [name]: value
      });
    }
  };

  // Delete a lab result
  const deleteLab = (index: number) => {
    const updatedLabs = [...reviewedLabs];
    updatedLabs.splice(index, 1);
    setReviewedLabs(updatedLabs);
    toast.success('Lab value removed');
  };

  // Add a new lab result
  const addNewLab = () => {
    setEditIndex(-1); // -1 indicates a new entry
    setEditValues({
      code: '',
      name: '',
      value: 0,
      unit: '',
      ref_range_low: undefined,
      ref_range_high: undefined,
    });
  };

  // Save new lab
  const saveNewLab = () => {
    // Validate required fields
    if (!editValues.code || !editValues.name || !editValues.unit) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Get SI values based on the new values
    const { value_si, unit_si } = convertToSI(
      editValues.code,
      editValues.value,
      editValues.unit
    );
    
    // Create new lab with both original and SI values
    const newLab = {
      ...editValues,
      value_si,
      unit_si
    };
    
    setReviewedLabs([...reviewedLabs, newLab]);
    setEditIndex(null);
    toast.success('New lab value added');
  };

  // Proceed to interpretation
  const proceedToInterpretation = async () => {
    // Validate demographics
    if (!demographics.age || !demographics.sex) {
      toast.error('Please provide age and sex information');
      return;
    }
    
    // Validate labs
    if (!reviewedLabs || reviewedLabs.length === 0) {
      toast.error('No lab results to interpret');
      return;
    }
    
    setLoading(true);
    try {
      // Since we're now using the context to share data between pages,
      // we can just navigate to the results page
      router.push('/results');
    } catch (error) {
      console.error('Error proceeding to interpretation:', error);
      toast.error('Failed to proceed to interpretation');
      setLoading(false);
    }
  };

  // If no labs data, show loading or redirect
  if (!reviewedLabs) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Review Lab Results</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push('/upload')}>
              Back to Upload
            </Button>
            <Button 
              disabled={loading || reviewedLabs.length === 0}
              onClick={proceedToInterpretation}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                'Continue to Results'
              )}
            </Button>
          </div>
        </div>

        {/* Demographics form */}
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Demographics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="age"
                value={demographics.age || ''}
                onChange={handleDemographicsChange}
                placeholder="Enter age"
                required
                min={0}
                max={120}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sex <span className="text-red-500">*</span>
              </label>
              <Select
                name="sex"
                value={demographics.sex || ''}
                onChange={handleDemographicsChange}
                required
              >
                <option value="">Select sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <Input
                type="number"
                name="height"
                value={demographics.height || ''}
                onChange={handleDemographicsChange}
                placeholder="Height in cm"
                min={0}
                max={300}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <Input
                type="number"
                name="weight"
                value={demographics.weight || ''}
                onChange={handleDemographicsChange}
                placeholder="Weight in kg"
                min={0}
                max={500}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for lab test
              </label>
              <Input
                type="text"
                name="reason"
                value={demographics.reason || ''}
                onChange={handleDemographicsChange}
                placeholder="Why were these labs ordered?"
              />
            </div>
          </div>
        </Card>

        {/* Lab results table */}
        <Card className="mb-8 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Lab Results</h2>
            <Button size="sm" onClick={addNewLab}>
              Add New Lab
            </Button>
          </div>
          
          {reviewedLabs.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No lab results to review. Go back to upload or add a new lab manually.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SI Value
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference Range
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviewedLabs.map((lab, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{lab.name}</div>
                        <div className="text-sm text-gray-500">{lab.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editIndex === index ? (
                          <div className="flex space-x-2">
                            <Input
                              type="number"
                              name="value"
                              value={editValues.value}
                              onChange={handleEditChange}
                              className="w-24"
                              step="0.01"
                            />
                            <Input
                              type="text"
                              name="unit"
                              value={editValues.unit}
                              onChange={handleEditChange}
                              className="w-20"
                              placeholder="Unit"
                            />
                          </div>
                        ) : (
                          <span>{lab.value} {lab.unit}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lab.value_si} {lab.unit_si}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editIndex === index ? (
                          <div className="flex space-x-2">
                            <Input
                              type="number"
                              name="ref_range_low"
                              value={editValues.ref_range_low || ''}
                              onChange={handleEditChange}
                              className="w-20"
                              placeholder="Min"
                              step="0.01"
                            />
                            <span className="self-center">-</span>
                            <Input
                              type="number"
                              name="ref_range_high"
                              value={editValues.ref_range_high || ''}
                              onChange={handleEditChange}
                              className="w-20"
                              placeholder="Max"
                              step="0.01"
                            />
                          </div>
                        ) : (
                          <>
                            {lab.ref_range_low !== undefined && lab.ref_range_high !== undefined ? (
                              <span>{lab.ref_range_low} - {lab.ref_range_high}</span>
                            ) : lab.ref_range_low !== undefined ? (
                              <span>&gt; {lab.ref_range_low}</span>
                            ) : lab.ref_range_high !== undefined ? (
                              <span>&lt; {lab.ref_range_high}</span>
                            ) : (
                              <span className="text-gray-400">Not specified</span>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editIndex === index ? (
                          <div className="flex justify-end space-x-2">
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={saveEdit}>
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <Button size="sm" variant="outline" onClick={() => startEdit(index)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteLab(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Add new lab form */}
                  {editIndex === -1 && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <Input
                            type="text"
                            name="name"
                            value={editValues.name}
                            onChange={handleEditChange}
                            placeholder="Test name"
                            className="w-full"
                          />
                          <Input
                            type="text"
                            name="code"
                            value={editValues.code}
                            onChange={handleEditChange}
                            placeholder="Test code"
                            className="w-full"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            name="value"
                            value={editValues.value || ''}
                            onChange={handleEditChange}
                            className="w-24"
                            placeholder="Value"
                            step="0.01"
                          />
                          <Input
                            type="text"
                            name="unit"
                            value={editValues.unit}
                            onChange={handleEditChange}
                            className="w-20"
                            placeholder="Unit"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-400">SI values will be calculated</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            name="ref_range_low"
                            value={editValues.ref_range_low || ''}
                            onChange={handleEditChange}
                            className="w-20"
                            placeholder="Min"
                            step="0.01"
                          />
                          <span className="self-center">-</span>
                          <Input
                            type="number"
                            name="ref_range_high"
                            value={editValues.ref_range_high || ''}
                            onChange={handleEditChange}
                            className="w-20"
                            placeholder="Max"
                            step="0.01"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={saveNewLab}>
                            Add
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="flex justify-end mt-8">
          <Button 
            disabled={loading || reviewedLabs.length === 0}
            onClick={proceedToInterpretation}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              'Continue to Results'
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
