import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FiSave, FiX, FiCamera } from "react-icons/fi";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useAuthStore } from "../store/authStore";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { FadeIn, SlideIn } from "../components/animations";
import api from "../services/api";

const Profile = () => {
  const assetBaseRaw =
    import.meta.env.VITE_ASSET_URL || import.meta.env.VITE_API_URL || "";
  const assetBase = assetBaseRaw
    .replace(/\/api\/v1\/?$/i, "")
    .replace(/\/+$/i, "");
  
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const { success: showSuccess, error: showError } = useToast();

  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  
  const isOwnProfile = !userId || userId === currentUser?.id;
  
  // For displaying the profile (either current user or fetched user)
  const [displayUser, setDisplayUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState("");
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    location: "",
    bio: "",
  });

  // Fetch user profile when viewing someone else's profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isOwnProfile) {
        setDisplayUser(currentUser);
      } else if (userId) {
        setLoading(true);
        try {
          const response = await api.get(`/users/${userId}`);
          setDisplayUser(response.data.data);
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          showError('Failed to load user profile');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchUserProfile();
  }, [userId, currentUser, isOwnProfile]);

  // Update form data when displayUser changes
  useEffect(() => {
    if (displayUser) {
      const employeeData = displayUser.employeeData || {};
      const employmentDetails = employeeData.employmentDetails || {};
      const personalInfo = employeeData.personalInfo || {};
      const profile = displayUser.profile || {};

      const location = employmentDetails.workLocation || profile.location || "";
      const bio = personalInfo.bio || profile.bio || "";

      setFormData({
        name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
        email: displayUser.email || "",
        phone: profile.phone || "",
        department: employmentDetails.department || displayUser.employeeDetails?.department || "",
        position: employmentDetails.position || displayUser.employeeDetails?.position || "",
        location: location,
        bio: bio,
      });
    }
  }, [displayUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only allow editing own profile
    if (!isOwnProfile) {
      showError("You cannot edit another user's profile");
      return;
    }

    const nameParts = formData.name.trim().split(" ").filter(Boolean);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const payload = {};

    const profile = {};
    if (firstName) profile.firstName = firstName;
    if (lastName) profile.lastName = lastName;
    if (formData.phone) profile.phone = formData.phone;
    if (formData.bio) profile.bio = formData.bio;
    if (Object.keys(profile).length > 0) payload.profile = profile;

    const employeeDetails = {};
    if (formData.department) employeeDetails.department = formData.department;
    if (formData.position) employeeDetails.position = formData.position;
    if (formData.location) employeeDetails.workLocation = formData.location;
    if (Object.keys(employeeDetails).length > 0)
      payload.employeeDetails = employeeDetails;

    if (formData.bio) {
      payload.personalInfo = { bio: formData.bio };
    }

    if (formData.email !== displayUser?.email && formData.email) {
      payload.email = formData.email;
    }

    if (Object.keys(payload).length === 0) {
      showError("No changes to update");
      return;
    }

    const result = await updateProfile(payload);

    if (result.success) {
      showSuccess("Profile updated successfully");
      setIsEditing(false);
      await checkAuth();
      // Refresh displayed user
      if (isOwnProfile) {
        setDisplayUser(currentUser);
      }
    } else {
      showError(result.error);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarUpload = async (event) => {
    // Only allow avatar upload for own profile
    if (!isOwnProfile) {
      showError("You cannot change another user's avatar");
      return;
    }
    
    const file = event.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await api.post("/auth/upload-avatar", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        await checkAuth();
        showSuccess("Avatar updated");
      }
    } catch (error) {
      showError(error.response?.data?.message || "Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="text-center py-8">
        <p className="text-rose-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">
              {isOwnProfile ? "My Profile" : `${displayUser.profile?.firstName || "User"}'s Profile`}
            </h1>
            <p className="text-secondary-600 mt-1">
              {isOwnProfile ? "Manage your personal information" : "View user information"}
            </p>
          </div>

          {isOwnProfile && !isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : isOwnProfile && isEditing ? (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data from current user
                  if (displayUser) {
                    const employeeData = displayUser.employeeData || {};
                    const employmentDetails = employeeData.employmentDetails || {};
                    const personalInfo = employeeData.personalInfo || {};
                    const profile = displayUser.profile || {};

                    setFormData({
                      name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
                      email: displayUser.email || "",
                      phone: profile.phone || "",
                      department: employmentDetails.department || "",
                      position: employmentDetails.position || "",
                      location: employmentDetails.workLocation || "",
                      bio: personalInfo.bio || "",
                    });
                  }
                }}
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
          ) : null}
        </div>
      </FadeIn>

      <SlideIn direction="up">
        <div className="bg-white rounded-xl shadow-soft border border-secondary-200 overflow-hidden">
          <div className="relative h-20 bg-gradient-to-r bg-linear-to-r from-[#0f729c] to-[#003b54]">
            <div className="absolute -bottom-10 left-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-xl bg-white shadow-md">
                  {displayUser?.profile?.avatar && displayUser.profile.avatar !== "avatar.png" ? (
                    <img
                      src={`${assetBase}/uploads/avatars/${displayUser.profile.avatar}`}
                      className="w-full h-full rounded-lg object-cover"
                      alt="avatar"
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {getInitials(formData.name || displayUser.profile?.firstName || "U")}
                      </span>
                    </div>
                  )}
                </div>

                {isOwnProfile && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md hover:bg-secondary-50"
                    >
                      {uploadingAvatar ? (
                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiCamera size={24} className="text-amber-600 p-1" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="pt-16 p-6">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing || !isOwnProfile}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!isEditing || !isOwnProfile}
                  required
                />

                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled={!isEditing || !isOwnProfile}
                />

                <Input
                  label="Department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  disabled={true} // Department can't be edited by user
                />

                <Input
                  label="Position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  disabled={true} // Position can't be edited by user
                />

                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  disabled={!isEditing || !isOwnProfile}
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
                  disabled={!isEditing || !isOwnProfile}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-secondary-50 text-gray-800 "
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
