import type { MetaField } from "./MetaDataPage";

export const formSchema: MetaField[] = [
    { key: "author", label: "Autor:in", type: "text", placeholder: "Name hier eingeben" },
    { key: "series", label: "Aufgaben-Serie", type: "text" },
    { key: "taskId", label: "Aufgaben-ID", type: "text" },
    { key: "version", label: "Versionsnummer", type: "text" },

    { key: "competencies", label: "Liste der getesteten Kompetenzen (Semikolon getrennt)", type: "textarea" },

    {
        key: "mathProcesses",
        label: "Mathematikbezogene kognitive Prozesse",
        type: "checkbox",
        options: [
            "Wissen, Erkennen und Beschreiben",
            "Operieren und Berechnen",
            "Darstellen und Formalisieren",
            "Erforschen und Explorieren",
            "Mathematisieren und Modellieren",
            "Argumentieren und Begründen",
            "Instrumente und Werkzeuge verwenden",
            "Interpretieren und Reflektieren von Resultaten",
        ],
    },

    { key: "competenceLevel", label: "Kompetenzstufe aus Lehrplan 21", type: "text" },

    {
        key: "competenceLevelOptions",
        label: "Kompetenzniveau",
        type: "checkbox",
        options: [
            "Kompetenzniveau I (Jahrgangsstufe 8)",
            "Kompetenzniveau II (Jahrgangsstufe 8)",
            "Kompetenzniveau III (Jahrgangsstufe 8)",
            "Kompetenzniveau IV (Jahrgangsstufe 8)",
        ],
    },

    {
        key: "didacticAnalysis",
        label: "Fachdidaktische Analyse Inhaltsbezogene Subdimensionen",
        type: "checkbox",
        options: [
            "Funktionales Verständnis / Grundlagen",
            "Steigung",
            "y-Achsenabschnitt",
            "Nullstellen",
            "Schnittpunkte",
            "Parallelität und Orthogonalität",
            "Darstellungswechsel",
            "Lineares Wachstum / Modellierung",
        ],
    },

    { key: "addressedConcepts", label: "Liste adressierter Grundvorstellungen (Semikolon getrennt)", type: "textarea" },

    {
        key: "taskRepresentations",
        label: "Darstellungen in der Aufgabenstellung",
        type: "checkbox",
        options: [
            "Sachsituation / Realkontext / kontextualisierte Verbalbeschreibung",
            "Innermathematische Verbalbeschreibung",
            "Wertetabelle",
            "Koordinatensystem / Funktionsgraph",
            "Funktionsterm / Funktionsgleichung",
            "Arithmetisches Register",
        ],
    },

    {
        key: "solutionRepresentations",
        label: "Darstellungen bei der Aufgabenbearbeitung",
        type: "checkbox",
        options: [
            "Sachsituation / Realkontext / kontextualisierte Verbalbeschreibung",
            "Innermathematische Verbalbeschreibung",
            "Wertetabelle",
            "Koordinatensystem / Funktionsgraph",
            "Funktionsterm / Funktionsgleichung",
            "Arithmetisches Register",
        ],
    },

    { key: "answerFormat", label: "Antwortformat", type: "text" },
    { key: "expectedTime", label: "Erwartete mittlere Bearbeitungszeit (Minuten)", type: "text" },
    { key: "additionalNotes", label: "Zusätzliche Hinweise oder Kommentare", type: "textarea" },
    { key: "sourceTask", label: "Quelle(n) Aufgabenidee", type: "textarea" },
    { key: "sourceImage", label: "Quelle Bild(er)", type: "textarea" },

    {
        key: "gradeLevels",
        label: "Jahrgangsstufe",
        type: "checkbox",
        options: ["7", "8", "9", "10", "11", "12"],
    },
];
