import { useState, useEffect } from 'react';
import { UploadCloud, FileSpreadsheet, Plus, X, Loader2, Play } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import * as xlsx from 'xlsx';

const UploadFeedback = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  
  const [fileEntries, setFileEntries] = useState([
    { id: Date.now(), file: null, type: 'CO', previewData: [] }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFile = () => {
    if (fileEntries.length >= 3) return;
    setFileEntries([...fileEntries, { id: Date.now(), file: null, type: 'CO', previewData: [] }]);
  };

  const handleRemoveFile = (id) => {
    if (fileEntries.length === 1) return;
    setFileEntries(fileEntries.filter(entry => entry.id !== id));
  };

  const handleFileChange = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newEntries = [...fileEntries];
    newEntries[index].file = file;

    // Read preview using SheetJS
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = xlsx.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = xlsx.utils.sheet_to_json(ws, { header: 1 }); // read as 2D array
        
        // Take first 6 rows for preview (header + 5 data)
        newEntries[index].previewData = data.slice(0, 6);
        setFileEntries(newEntries);
      } catch (err) {
        console.error('Failed to parse excel file', err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleTypeChange = (index, val) => {
    const newEntries = [...fileEntries];
    newEntries[index].type = val;
    setFileEntries(newEntries);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      setMessage({ type: 'error', text: 'Please select a course.' });
      return;
    }

    const validFiles = fileEntries.filter(f => f.file);
    if (validFiles.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one file.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('courseId', selectedCourse);

    const typesArray = [];
    validFiles.forEach((entry) => {
      formData.append('files', entry.file);
      typesArray.push(entry.type);
    });
    
    formData.append('fileTypes', JSON.stringify(typesArray));

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/manual-feedback/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage({ type: 'success', text: 'Files uploaded and processed successfully!' });
      
      // Reset form
      setFileEntries([{ id: Date.now(), file: null, type: 'CO', previewData: [] }]);
      setSelectedCourse('');
    } catch (err) {
      console.error('Upload failed:', err);
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to upload files.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN" title="Upload Feedback">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-textBase">Manual Feedback Upload</h2>
        <p className="text-textMuted mt-1">Upload manually collected feedback forms (Excel/CSV) and analyze attainment.</p>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-xl ${message.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card !p-6 space-y-8">
        {/* Course Selection */}
        <div>
          <label className="block text-sm font-semibold text-textBase mb-2">Select Course</label>
          {loading ? (
             <div className="flex items-center gap-2 text-textMuted text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Fetching courses...
             </div>
          ) : (
            <select
              required
              className="input-field max-w-md"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">-- Choose Course --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.name} ({c.branch} Sem {c.semester})</option>
              ))}
            </select>
          )}
        </div>

        {/* File Entries */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-textBase items-center flex gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" /> Upload Data Files
            </h3>
            {fileEntries.length < 3 && (
              <button
                type="button"
                onClick={handleAddFile}
                className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add File
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {fileEntries.map((entry, index) => (
              <div key={entry.id} className="bg-surfaceHighlight/20 border border-surfaceHighlight p-5 rounded-2xl relative">
                {fileEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(entry.id)}
                    className="absolute top-4 right-4 text-textMuted hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                <h4 className="font-medium text-textBase mb-4">File {index + 1}</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-textMuted mb-1.5">Feedback Type</label>
                    <select
                      className="input-field text-sm"
                      value={entry.type}
                      onChange={(e) => handleTypeChange(index, e.target.value)}
                    >
                      <option value="CO">Course Outcomes (CO)</option>
                      <option value="CURRICULUM">Curriculum Gap Options</option>
                      <option value="TEACHING">Teaching-Learning Methods</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-textMuted mb-1.5">Select Excel/CSV</label>
                    <input
                      required
                      type="file"
                      accept=".xlsx, .csv"
                      className="block w-full text-sm text-textMuted
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary/10 file:text-primary
                        hover:file:bg-primary/20 transition-all cursor-pointer"
                      onChange={(e) => handleFileChange(index, e)}
                    />
                  </div>

                  {/* Data Preview */}
                  {entry.previewData.length > 0 && (
                    <div className="mt-4 overflow-x-auto border border-surfaceHighlight rounded-xl">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-surfaceHighlight/50 text-textMuted">
                          <tr>
                            {entry.previewData[0]?.map((header, i) => (
                              <th key={i} className="px-3 py-2 font-semibold truncate max-w-[100px]">{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surfaceHighlight">
                          {entry.previewData.slice(1).map((row, rI) => (
                            <tr key={rI} className="hover:bg-surfaceHighlight/10">
                              {entry.previewData[0]?.map((_, cI) => (
                                <td key={cI} className="px-3 py-2 truncate max-w-[100px] text-textBase/80">{row[cI] || '-'}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="bg-surfaceHighlight/30 text-center text-xs py-1 text-textMuted font-medium">
                        Previewing top 5 rows
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-surfaceHighlight flex justify-end">
          <button
            type="submit"
            disabled={uploading}
            className="btn-primary flex items-center gap-2"
          >
            {uploading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              <><UploadCloud className="w-5 h-5" /> Upload & Analyze</>
            )}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default UploadFeedback;
