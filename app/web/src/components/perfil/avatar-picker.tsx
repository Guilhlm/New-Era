import NextImage from 'next/image';
import { MdOutlineCameraAlt } from 'react-icons/md';
import type { AvatarPickerProps } from '@/components/perfil/profile-form.types';

export function AvatarPicker({
  userName,
  avatarPhoto,
  avatarInputRef,
  onAvatarFileChange,
  photoUploading,
}: AvatarPickerProps) {
  return (
    <>
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => void onAvatarFileChange(e)}
        tabIndex={-1}
      />
      <div className="mx-auto mb-8 mt-4 flex shrink-0 justify-center">
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          disabled={photoUploading}
          className="group relative h-56 w-56 shrink-0 overflow-hidden rounded-full border-2 border-grey bg-layer2 disabled:cursor-wait disabled:opacity-70"
          aria-label="Change profile photo"
        >
          <AvatarContent userName={userName} avatarPhoto={avatarPhoto} />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
            {photoUploading ? (
              <span className="text-xs text-text">…</span>
            ) : (
              <MdOutlineCameraAlt className="h-9 w-9 text-text" aria-hidden />
            )}
          </span>
        </button>
      </div>
    </>
  );
}

function AvatarContent({ userName, avatarPhoto }: { userName: string; avatarPhoto: string | null }) {
  if (avatarPhoto?.startsWith('data:') || avatarPhoto?.startsWith('http')) {
    // eslint-disable-next-line @next/next/no-img-element -- data URL e URLs externas
    return <img src={avatarPhoto} alt="" className="h-full w-full object-cover" />;
  }

  if (avatarPhoto) {
    return <NextImage src={avatarPhoto} alt="" fill className="object-cover" sizes="224px" />;
  }

  const initials =
    userName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';

  return (
    <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-text/80">
      {initials}
    </div>
  );
}
