import fs from 'fs';
import path from 'path';

const sourceDir = './frontend/components/ui';
const targetDir = './frontend/src/components/ui';

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const files = fs.readdirSync(sourceDir);

files.forEach((file) => {
  if (!file.endsWith('.tsx')) return;
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file.replace('.tsx', '.jsx'));

  let content = fs.readFileSync(sourcePath, 'utf8');

  // Remove type imports
  content = content.replace(/,?\s*type\s+\w+/g, '');
  content = content.replace(/import\s+type\s+[^;]+;/g, '');

  // Strip generic types from functions and props
  content = content.replace(/:\s*React\.ComponentProps(?:WithoutRef)?<"[^"]+">/g, '');
  content = content.replace(/:\s*React\.ComponentProps(?:WithoutRef)?<typeof [^>]+>/g, '');
  content = content.replace(/:\s*React\.ComponentProps(?:WithoutRef)?<any>/g, '');
  content = content.replace(/:\s*React\.ComponentProps<"[^"]+">/g, '');
  content = content.replace(/:\s*React\.CSSProperties/g, '');
  content = content.replace(/as\s+React\.CSSProperties/g, '');
  content = content.replace(/as\s+ToasterProps\["theme"\]/g, '');
  content = content.replace(/as\s+React\.ElementType/g, '');

  // Strip specific element type casting in functions
  content = content.replace(/:\s*AvatarPrimitive\.Root\.Props\s*&\s*\{\s*size\??:\s*"default"\s*\|\s*"sm"\s*\|\s*"lg"\s*\}/g, '');
  content = content.replace(/:\s*AvatarPrimitive\.\w+\.Props/g, '');
  content = content.replace(/:\s*useRender\.ComponentProps<"[^"]+">\s*&\s*VariantProps<typeof [^>]+>/g, '');
  content = content.replace(/:\s*ButtonPrimitive\.Props\s*&\s*VariantProps<typeof [^>]+>/g, '');
  content = content.replace(/:\s*ScrollAreaPrimitive\.\w+\.Props/g, '');
  content = content.replace(/:\s*SeparatorPrimitive\.Props/g, '');
  content = content.replace(/:\s*ToasterProps/g, '');
  content = content.replace(/<"span">/g, '');
  content = content.replace(/mergeProps<"span">/g, 'mergeProps');

  // Let's do some custom replacements for specific files if they have tricky types
  // e.g. dropdown-menu.tsx, dialog.tsx, sheet.tsx, tabs.tsx
  // Let's replace any lingering React.ComponentProps or generic annotations
  content = content.replace(/:\s*React\.\w+Props/g, '');
  content = content.replace(/:\s*React\.ComponentProps<[^>]+>/g, '');
  content = content.replace(/:\s*React\.ComponentPropsWithoutRef<[^>]+>/g, '');
  content = content.replace(/:\s*React\.HTMLAttributes<[^>]+>/g, '');
  content = content.replace(/:\s*React\.HTMLProps<[^>]+>/g, '');
  content = content.replace(/:\s*React\.HTMLProps<[^>]+>\s*&\s*[^)]+/g, '');
  content = content.replace(/:\s*React\.RefAttributes<[^>]+>/g, '');
  content = content.replace(/:\s*DialogPrimitive\.\w+\.Props/g, '');
  content = content.replace(/:\s*DropdownMenuPrimitive\.\w+\.Props/g, '');
  content = content.replace(/:\s*SheetPrimitive\.\w+\.Props/g, '');
  content = content.replace(/:\s*TabsPrimitive\.\w+\.Props/g, '');
  content = content.replace(/:\s*TabPrimitive\.\w+\.Props/g, '');

  // Strip generic types from props: e.g. ": typeof ... "
  content = content.replace(/:\s*typeof\s+\w+/g, '');

  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`Converted ${file} -> ${path.basename(targetPath)}`);
});
