import { useToast } from "@chakra-ui/react";

export default function useCopyToClipboard() {
    const showToast = useToast();

    return async (value: string) => {
        if (!navigator?.clipboard) {
            showToast({
                title: 'Sorry your device does not support the clipboard copy',
                status: 'error',
            });
        }

        try {
            await navigator.clipboard.writeText(value);

            showToast({
                title: 'Successfuly copied',
                status: 'success',
            });
        } catch (e) {
            showToast({
                title: 'The copy failed',
                status: 'error',
            });
        }
    };
}

