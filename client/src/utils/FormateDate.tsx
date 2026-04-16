export const formatDate = (isoString: string): string => {
    if(!isoString) return "-"
    const date = new Date(isoString);
  
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" }); 
    const year = date.getFullYear();
  
    return `${day} ${month} ${year}`;
  };

export const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
  
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'P.M.' : 'A.M.';
  
    hours = hours % 12;
    hours = hours ? hours : 12; 
  
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
    return `${hours}:${formattedMinutes} ${ampm}`;
  };