
function findPanel() {
    let element = document.querySelector('#ViewerPropertyPanel-scroll-container');

    if (element) {
        
        element.style.visibility = 'hidden';
        // The element was found! You can now perform operations on it.
        let groups = element.querySelectorAll('.category');
        if (groups && groups.length > 1) {
            groups.forEach(group => {
                // Check the lmv-nodeid attribute
                let nodeId = group.getAttribute('lmv-nodeid');
                if (nodeId !== 'IFC' && nodeId !== '413_Pset_Windows') {
                    group.remove();
                }
            });
        }
        element.style.visibility = 'visible';
        // console.log(element);
    } else {
        // The element was not found.
        console.log('Element not found.');
    }
}

let intervalId = setInterval(findPanel, 1000);

