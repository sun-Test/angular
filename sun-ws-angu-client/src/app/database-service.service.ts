import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WsServiceService } from './ws-service.service';

const LOAD_MORE = 'LOAD_MORE';

const UPDATE_TREE_ROOT = 'updatetree01Root';
const UPDATE_TREE_CHILDREN = 'updatetree01Children';
const TREE_ROOT = 'tree01 root';
const TREE_CHILDREN = 'tree01 children';
const WS_READY='wsReady';

export class NodeItem {
  constructor(public id: string,
              public name: string){}
}

/** Nested node */
export class LoadmoreNode {
  childrenChange = new BehaviorSubject<LoadmoreNode[]>([]);

  get children(): LoadmoreNode[] {
    return this.childrenChange.value;
  }

  constructor(public item: NodeItem,
              public hasChildren = false,
              public loadMoreParentItem: NodeItem | null = null) {}
}

/** Flat node with expandable and level information */
export class LoadmoreFlatNode {
  constructor(public item: NodeItem,
              public level = 1,
              public expandable = false,
              public loadMoreParentItem: NodeItem | null = null) {}
}

/**
 * A database that only load part of the data initially. After user clicks on the `Load more`
 * button, more data will be loaded.
 */
@Injectable()
export class DatabaseService {
  batchNumber = 5;
  dataChange = new BehaviorSubject<LoadmoreNode[]>([]);
  nodeMap = new Map<NodeItem, LoadmoreNode>();

  /** The data */
  //= ['programming', 'life and study']
  rootLevelNodes: NodeItem[] = [];
  dataMap = new Map<string, NodeItem[]>( );//

    //inject dependence
    constructor(private wsServiceService: WsServiceService) { 

      this.wsServiceService.listen(WS_READY).subscribe((data) => {
        console.log('received WS_READY event');
        this.wsServiceService.emit(UPDATE_TREE_ROOT, 'getRoot');
        this.wsServiceService.emit(UPDATE_TREE_CHILDREN, 'getChildren');
      });
  
       
        }
    
  initialize() {
      this.wsServiceService.listen(TREE_CHILDREN).subscribe((childrenData:any) => {
              console.log('get event: tree01 children');
              console.log(childrenData);
              
             let tmpMap = new Map<NodeItem, NodeItem[]>(childrenData['children']);
              tmpMap.forEach((value, key) => {
                this.dataMap.set(key.id, value);
              });
              const data = this.rootLevelNodes.map(name => this._generateNode(name));
              this.dataChange.next(data);
          
            });
 
      this.wsServiceService.listen(TREE_ROOT).subscribe((rootData: any) => {
            console.log('get event: tree01 root');
            console.log(rootData);
            this.rootLevelNodes = rootData['root'];
          
          });
      
  }

  /** Expand a node whose children are not loaded */
  loadMore(item: NodeItem, onlyFirstTime = false) {
    //console.log(this.dataMap);
    if (!this.nodeMap.has(item) || !this.dataMap.has(item.id)) {
      return;
    }
    const parent = this.nodeMap.get(item)!;
    const children = this.dataMap.get(item.id)!;
    if (onlyFirstTime && parent.children!.length > 0) {
      return;
    }
    const newChildrenNumber = parent.children!.length + this.batchNumber;
    const nodes = children.slice(0, newChildrenNumber)
      .map(name => this._generateNode(name));
    if (newChildrenNumber < children.length) {
      // Need a new load more node
      nodes.push(new LoadmoreNode(new NodeItem(LOAD_MORE, ""), false, item));
    }

    parent.childrenChange.next(nodes);
    this.dataChange.next(this.dataChange.value);
  }

  private _generateNode(item: NodeItem): LoadmoreNode {
    if (this.nodeMap.has(item)) {
      return this.nodeMap.get(item)!;
    }
    console.log('dataMap Keys: ')
    console.log([...this.dataMap.keys()])
    console.log(item.name);
    console.log(this.dataMap.has(item.id));
    const result = new LoadmoreNode(item, this.dataMap.has(item.id));
    this.nodeMap.set(item, result);
    return result;
  }
}

