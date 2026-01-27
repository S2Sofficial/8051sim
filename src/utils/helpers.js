export const parseValue = (val, symbols = {}) => {
    if (!val) return 0;
    let raw = val.trim();
    if (raw.startsWith('#')) raw = raw.substring(1);
    if (symbols[raw] !== undefined) return symbols[raw];
    if (raw.toUpperCase().endsWith('H')) return parseInt(raw.substring(0, raw.length - 1), 16);
    if (raw.toUpperCase().endsWith('B')) return parseInt(raw.substring(0, raw.length - 1), 2);
    const intVal = parseInt(raw, 10);
    return isNaN(intVal) ? 0 : intVal;
};

export const parseLine = (line, lineNumber) => {
  const cleanLine = line.split(';')[0].trim();
  if (!cleanLine) return null;
  
  const equMatch = cleanLine.match(/^([a-zA-Z0-9_?]+)\s+EQU\s+(.+)/i);
  if (equMatch) return { label: equMatch[1], mnemonic: 'EQU', operands: [equMatch[2].trim()], original: line, lineNumber };

  let label = null;
  let instructionPart = cleanLine;

  const labelMatch = cleanLine.match(/^([a-zA-Z0-9_?]+):/);
  if (labelMatch) {
      label = labelMatch[1];
      instructionPart = cleanLine.substring(labelMatch[0].length).trim();
  }

  if (!instructionPart) return { label, mnemonic: null, operands: [], original: line, lineNumber };
  const tokens = instructionPart.split(/[\s,]+/);
  const mnemonic = tokens[0].toUpperCase();
  const operands = instructionPart.substring(mnemonic.length).split(',').map(o => o.trim()).filter(o => o !== "");
  return { label, mnemonic, operands, original: line, lineNumber };
};