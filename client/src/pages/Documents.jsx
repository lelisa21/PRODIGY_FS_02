import { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiFile } from 'react-icons/fi';
import { FadeIn, SlideIn } from '../components/animations';
import Input from '../components/common/Input';
import { useToast } from '../context/ToastContext';
import employeeService from '../services/employee.service';
import { formatDate } from '../utils/formatters';

const Documents = () => {
  const { error: showError } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await employeeService.getEmployees({ page: 1, limit: 1000 });
        setEmployees(response.data || []);
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showError]);

  const documents = useMemo(() => {
    return employees.flatMap((emp) =>
      (emp.documents || []).map((doc) => ({
        ...doc,
        employeeName: emp.name,
        employeeId: emp.employeeId,
      }))
    );
  }, [employees]);

  const filtered = useMemo(() => {
    if (!search) return documents;
    const term = search.toLowerCase();
    return documents.filter((doc) =>
      `${doc.name} ${doc.employeeName} ${doc.employeeId}`.toLowerCase().includes(term)
    );
  }, [documents, search]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <FadeIn>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Documents</h1>
          <p className="text-secondary-600 mt-1">All employee documents in one place</p>
        </div>
      </FadeIn>

      <SlideIn direction="up">
        <div className="mb-4">
          <Input
            placeholder="Search by document or employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
        </div>
      </SlideIn>

      <SlideIn direction="up" delay={0.1}>
        <div className="bg-white rounded-xl shadow-soft border border-secondary-200 overflow-hidden">
          {loading ? (
            <div className="p-6">
              <div className="skeleton h-64 rounded-lg" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-secondary-500">No documents found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {filtered.map((doc, index) => (
                    <tr key={doc.id || doc._id || index} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 text-sm text-secondary-900">
                        <div className="flex items-center gap-2">
                          <FiFile className="text-primary-500" />
                          {doc.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-700">
                        {doc.employeeName} {doc.employeeId ? `(${doc.employeeId})` : ''}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-700">
                        {formatDate(doc.uploadedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {doc.url && (
                          <a
                            href={doc.url}
                            download
                            className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            <FiDownload size={16} />
                            Download
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SlideIn>
    </div>
  );
};

export default Documents;
