import os
import zipfile

def package():
    src_dir = os.path.abspath('wordpress/crescelo')
    targets = [
        ('public/wordpress/crescelo.zip', 'crescelo/'),
        ('public/wordpress/ai-business-assistant.zip', 'crescelo/'),
    ]

    for rel_out, prefix in targets:
        out_path = os.path.abspath(rel_out)
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with zipfile.ZipFile(out_path, 'w', zipfile.ZIP_DEFLATED) as z:
            for root, dirs, files in os.walk(src_dir):
                for file in sorted(files):
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, src_dir)
                    # Enforce POSIX forward slashes in zip entries for Linux WordPress compatibility
                    archive_name = prefix + rel_path.replace('\\', '/')
                    z.write(full_path, arcname=archive_name)
        print(f"Packaged {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == '__main__':
    package()
