type ResetCompletedToolSourceOptions = {
    clearSource: () => void;
    fileInputs?: Array<HTMLInputElement | null | undefined>;
    objectUrls?: Iterable<string>;
};

export function resetCompletedToolSource({ clearSource, fileInputs = [], objectUrls = [] }: ResetCompletedToolSourceOptions) {
    for (const url of objectUrls) URL.revokeObjectURL(url);
    for (const input of fileInputs) if (input) input.value = '';
    clearSource();
}
