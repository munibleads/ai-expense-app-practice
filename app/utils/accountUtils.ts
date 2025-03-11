import { HierarchicalOption } from '@/app/components/common/HierarchicalSelect';

function parseAccountLine(line: string): { code?: string; label: string } {
  // Remove bullet points and trim
  const cleanLine = line.replace(/•/g, '').trim();
  
  // Match code pattern [xxxxx]
  const codeMatch = cleanLine.match(/\[\s*(\d+)\s*\]/);
  
  if (codeMatch) {
    const code = codeMatch[1];
    // Remove the code part and trim
    const label = cleanLine.replace(/\[\s*\d+\s*\]/, '').trim();
    return { code, label };
  }
  
  return { label: cleanLine };
}

function buildHierarchy(
  lines: string[],
  startIndex: number = 0,
  level: number = 0
): { options: HierarchicalOption[]; nextIndex: number } {
  const options: HierarchicalOption[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i].trimEnd();
    
    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Calculate indent level (each level is 5 spaces or 1 tab)
    const indentMatch = line.match(/^[\s\t]*/);
    const indentLevel = indentMatch ? Math.floor(indentMatch[0].length / 5) : 0;

    if (indentLevel < level) {
      // We've moved back up the hierarchy
      break;
    }

    if (indentLevel === level) {
      const { code, label } = parseAccountLine(line);
      
      // Create the option
      const option: HierarchicalOption = {
        id: code || `${label}-${level}-${i}`, // Ensure unique IDs
        label,
        level,
        ...(code && { code }),
      };

      // Look ahead for children
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trimEnd();
        const nextIndentMatch = nextLine.match(/^[\s\t]*/);
        const nextIndentLevel = nextIndentMatch ? Math.floor(nextIndentMatch[0].length / 5) : 0;

        if (nextIndentLevel > level) {
          // Process children
          const childResult = buildHierarchy(lines, i + 1, level + 1);
          if (childResult.options.length > 0) {
            option.children = childResult.options;
          }
          i = childResult.nextIndex - 1;
        }
      }

      options.push(option);
    }

    i++;
  }

  return { options, nextIndex: i };
}

export function parseAccountData(data: string): HierarchicalOption[] {
  const lines = data.split('\n');
  return buildHierarchy(lines).options;
} 