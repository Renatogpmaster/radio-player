export function useFormatters() {
  const toCommas = (num, decimals) => {
    let o = { style: 'decimal', minimumFractionDigits: decimals, maximumFractionDigits: decimals };
    return new Intl.NumberFormat('en-US', o).format(num);
  };

  const toText = (str, def) => {
    str = String(str || '').replace(/[^\w\`\'\-\,\.\!\?]+/g, ' ').replace(/\s\s+/g, ' ').trim();
    return str || String(def || '');
  };

  const strLimit = (value, size) => {
    if (!value) return '';
    value = value.toString();

    if (value.length <= size) {
      return value;
    }
    return value.substr(0, size) + '...';
  };

  return {
    toCommas,
    toText,
    strLimit
  };
}
