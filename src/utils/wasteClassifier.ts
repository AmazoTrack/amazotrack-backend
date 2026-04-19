export function classifyWaste(description: string): "I" | "II_A" | "II_B" {
    const text = description.toLowerCase();

    if(
        text.includes("bateria") ||
        text.includes("óleo") ||
        text.includes("químico") ||
        text.includes("solvente") ||
        text.includes("hospitalar") 
    ) return "I";

    if (
        text.includes("entulho") ||
        text.includes("vidro") ||
        text.includes("cerâmica") ||
        text.includes("areia") 
    ) return "II_B";

    return "II_A";
}