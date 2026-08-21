export const saveBlob = (function () {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style.display = "none";
  return function (blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
})();

export const sanitizeName = (str: string) =>
  str.replace(/\s+/g, "-").replace(/[^a-zæøåÆØÅA-Z0-9-_.]/g, "_");
