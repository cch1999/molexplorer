export default function addAllLigands(ligandList, addFn, notifyFn, delayMs = 0) {
    return new Promise(resolve => {
        let addedCount = 0;
        let skippedCount = 0;
        ligandList.forEach((ligand, index) => {
            setTimeout(() => {
                const success = addFn(ligand);
                if (success) {
                    addedCount++;
                } else {
                    skippedCount++;
                }
                if (index === ligandList.length - 1) {
                    let message = '';
                    if (addedCount > 0 && skippedCount > 0) {
                        message = `Added ${addedCount} new molecules, ${skippedCount} already existed`;
                    } else if (addedCount > 0) {
                        message = `Added ${addedCount} new molecules`;
                    } else {
                        message = `All ${skippedCount} molecules already existed`;
                    }
                    notifyFn(message, addedCount > 0 ? 'success' : 'info');
                    resolve({ added: addedCount, skipped: skippedCount });
                }
            }, index * delayMs);
        });
    });
}
