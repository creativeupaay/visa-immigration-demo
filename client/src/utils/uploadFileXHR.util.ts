// utility to upload a file to our backend
const uploadFileXHR = (
  body: { key: string; value: string | Blob }[],
  url: string,
  setProgress: React.Dispatch<React.SetStateAction<number>>,
  isProtected: boolean
): Promise<{ docURL: string; status: number }> => {
  // returning a promise
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    for (let i = 0; i < body.length; i++) {
      formData.append(body[i].key, body[i].value);
    }

    xhr.open("POST", url, true);

    if (isProtected) xhr.withCredentials = true;

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setProgress(percentComplete); // Call the progress callback
      }
    };

    // Handle respons
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        response["status"] = xhr.status;

        resolve(response); // Resolve with response text
      } else {
        console.log(new Error(xhr.statusText));
        reject(new Error(xhr.statusText)); // Reject with error
      }
    };

    // Handle network errors
    xhr.onerror = () => reject(new Error("Network error"));

    // Send the request
    xhr.send(formData);
  });
};

export default uploadFileXHR;
