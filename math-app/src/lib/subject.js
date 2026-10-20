import { createContext, useContext } from "react";

// The subject the screens below the library are showing: { id, info, api, local }.
// info is its entry in tutor/subjects.js, api its calls (subjectApi), and
// local(name) a device-storage key. Math keeps the keys it had before the
// library existed, so drawings and drafts carry over.
export const SubjectContext = createContext(null);

export const useSubject = () => useContext(SubjectContext);

export const localKey = (subject, name) => (subject === "math" ? `mp_${name}` : `mp_${subject}_${name}`);
