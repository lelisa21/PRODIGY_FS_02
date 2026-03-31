import { useState, useEffect } from 'react';
import { FiSave, FiX, FiCamera } from 'react-icons/fi';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import { FadeIn, SlideIn } from '../components/animations';

const Profile = () => {
const user = useAuthStore((state) => state.user);
const updateProfile = useAuthStore((state) => state.updateProfile);
const isLoading = useAuthStore((state) => state.isLoading);

const { success: showSuccess, error: showError } = useToast();

const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState({
name: '',
email: '',
phone: '',
department: '',
position: '',
location: '',
bio: '',
});

useEffect(() => {
if (user) {
setFormData({
name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
email: user.email || '',
phone: user.profile?.phone || '',
department: user.employeeDetails?.department || '',
position: user.employeeDetails?.position || '',
location: '',
bio: '',
});
}
}, [user]);

const handleSubmit = async (e) => {
e.preventDefault();


const nameParts = formData.name.trim().split(' ').filter(Boolean);
const firstName = nameParts[0] || '';
const lastName = nameParts.slice(1).join(' ');

const payload = {
  email: formData.email,
  profile: {
    firstName,
    lastName,
    phone: formData.phone || '',
  },
  employeeDetails: {
    department: formData.department || '',
    position: formData.position || '',
  },
};

const result = await updateProfile(payload);

if (result.success) {
  showSuccess('Profile updated successfully');
  setIsEditing(false);
} else {
  showError(result.error);
}


};

const getInitials = (name) => {
return name
.split(' ')
.filter(Boolean)
.map((word) => word[0])
.join('')
.toUpperCase()
.slice(0, 2);
};

return ( <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto"> <FadeIn> <div className="flex items-center justify-between mb-8"> <div> <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">
My Profile </h1> <p className="text-secondary-600 mt-1">
Manage your personal information </p> </div>

      {!isEditing ? (
        <Button onClick={() => setIsEditing(true)}>
          Edit Profile
        </Button>
      ) : (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
            icon={<FiX />}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            icon={<FiSave />}
          >
            Save Changes
          </Button>
        </div>
      )}
    </div>
  </FadeIn>

  <SlideIn direction="up">
    <div className="bg-white rounded-xl shadow-soft border border-secondary-200 overflow-hidden">
      <div className="relative h-32 bg-linear-to-r from-primary-500 to-primary-600">
        <div className="absolute -bottom-12 left-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-xl bg-white p-1 shadow-md">
              <div className="w-full h-full rounded-lg bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {getInitials(formData.name || 'U')}
                </span>
              </div>
            </div>

            {isEditing && (
              <button className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md hover:bg-secondary-50">
                <FiCamera size={14} className="text-primary-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-16 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={!isEditing}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={!isEditing}
              required
            />

            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={!isEditing}
            />

            <Input
              label="Department"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              disabled={!isEditing}
            />

            <Input
              label="Position"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              disabled={!isEditing}
            />

            <Input
              label="Location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              disabled={!isEditing}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-secondary-50"
              placeholder="Tell us about yourself..."
            />
          </div>
        </form>
      </div>
    </div>
  </SlideIn>
</div>

);
};

export default Profile;
