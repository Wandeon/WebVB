const DOMPurify = {
  sanitize: (input: string) =>
    input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ''),
};

export default DOMPurify;
