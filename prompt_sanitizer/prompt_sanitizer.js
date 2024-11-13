function sanitize_prompt(prompt) {

    while (prompt.includes("()")) {
        
        prompt = prompt.replace(/()/g, "");
    }

    return prompt;
}
