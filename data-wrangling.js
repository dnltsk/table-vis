function filterNet(tableType){
    addAll();

    simulation.nodes(nodes);
    simulation.force("link").links(links);

    if(tableType === null){
        restart();
        return;
    }

    //collect
    let tablesIdsToDrop = [];
    nodes.forEach((node) => {
       if(node.type !== "person" && node.type !== "vacancy" && node.type !== tableType){
           tablesIdsToDrop.push(node.xid);
       }
    });
    let linkIdsToDrop = [];
    links.forEach((link) => {
        if(tablesIdsToDrop.includes(link.source.xid)){
            linkIdsToDrop.push(link.xid);
            tablesIdsToDrop.push(link.target.xid);
        }
    });

    //delete
    tablesIdsToDrop.forEach((tableId) => {
        let indexToDelete=nodes.map(function(x){ return x.xid; }).indexOf(tableId);
        nodes.splice(indexToDelete,1);
    });
    linkIdsToDrop.forEach((linkId) => {
        let indexToDelete=links.map(function(x){ return x.xid; }).indexOf(linkId);
        links.splice(indexToDelete,1);
    });

    restart();


}

function addAll(){
    originalNodes.forEach(on => {
        if(!nodes.some(n => n.xid === on.xid)){
            nodes.push(JSON.parse(JSON.stringify(on)))
        }
    });
    originalLinks.forEach(ol => {
        if(!links.some(l => l.xid === ol.xid)){
            let newSourceIndex = nodes.map(function(x){ return x.xid; }).indexOf(ol.source);
            let newTargetIndex = nodes.map(function(x){ return x.xid; }).indexOf(ol.target);
            let newLink = {"source": newSourceIndex, "target": newTargetIndex, "xid": ol.xid};
            links.push(newLink);
        }
    });
}

function convertStructureToGraph(structJson) {
    let structTables = structJson.tables;
    let structPersons = structJson.persons;
    let structLinks = structJson.links;
    let graphNodes = [];
    let graphLinks = [];
    structLinks.forEach((structLink) => {

        let structTable = structTables.find((t) => {
            return t.name === structLink.tableName;
        });

        //add table node is not exists
        let tableNodeId = graphNodes.findIndex((graphNode) => {
            return graphNode.name === structLink.tableName;
        });
        if (tableNodeId === -1) {
            let newTableNodeId = graphNodes.length;
            graphNodes.push({
                "name": structTable.name,
                "type": structTable.type,
                "url": structTable.url,
                "xid": newTableNodeId
            });
            tableNodeId = newTableNodeId;
        }

        //create new person node
        let newPersonId = graphNodes.length;
        if (structLink.personName !== undefined) {
            //existing person
            let structPerson = structPersons.find((p) => {
                return p.name === structLink.personName;
            });
            graphNodes.push({
                "name": structPerson.name,
                "type": "person",
                "role": structLink.role,
                "xid": newPersonId
            });
        } else {
            //vacancy
            graphNodes.push({
                "name": "¯\\_(ツ)_/¯",
                "type": "vacancy",
                "role": structLink.role,
                "xid": newPersonId
            });
        }

        //create new graph link
        let newLinkId = graphLinks.length;
        graphLinks.push({"source": tableNodeId, "target": newPersonId, "xid": newLinkId})
    });

    return {"nodes": graphNodes, "links": graphLinks};
}

function sortNumber(a,b) {
    return a - b;
}