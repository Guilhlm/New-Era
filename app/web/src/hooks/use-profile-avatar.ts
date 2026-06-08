'use client';

import { useMemo, useRef, useState } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { updateProfile } from '@/services/profile';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';
import { PROFILE_UPDATED_EVENT } from '@/utils/events';
import { fileToResizedDataUrl } from '@/utils/profile';

type UseProfileAvatarParams = {
  photoUser: string | null | undefined;
  onProfileUpdated: () => Promise<void>;
};

export function useProfileAvatar({ photoUser, onProfileUpdated }: UseProfileAvatarParams) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const avatarPhoto = useMemo(() => {
    if (!photoUser) return null;
    if (photoUser.startsWith('data:')) return photoUser;
    if (photoUser.startsWith('http')) return photoUser;
    if (photoUser.startsWith('/')) return photoUser;
    return null;
  }, [photoUser]);

  async function onAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file?.type.startsWith('image/')) {
      toastAuthError('Please choose an image file.');
      return;
    }

    setPhotoUploading(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      await updateProfile({ photoUser: dataUrl });
      toastUpdated(CRUD_TOAST.photoUpdated);
      await onProfileUpdated();
      window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not process the image.';
      toastAuthError(message);
    } finally {
      setPhotoUploading(false);
    }
  }

  return {
    data: {
      avatarPhoto,
      photoUploading,
    },
    refs: {
      avatarInputRef,
    },
    actions: {
      onAvatarFileChange,
    },
  };
}
