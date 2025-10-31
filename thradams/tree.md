
{{{cpp

#define nullptr 0

template<class E>
class Node
{
  Node* m_pParentNode;
  
  Node* m_pNext;
  Node* m_pPrev;
  
  Node* m_pHead;
  Node* m_pTail;

  E m_element;


public:

   Node(const E& v) :
  m_element(v),
  m_pParentNode(nullptr),
  m_pNext(nullptr),
  m_pPrev(nullptr),  
  m_pHead(nullptr),
  m_pTail(nullptr)
  {
  }

  Node(const E& v,
       Node* pParentNode,
       Node* pPrev,
       Node* pNext) :
  m_element(v),
  m_pParentNode(pParentNode),
  m_pNext(pNext),
  m_pPrev(pPrev),  
  m_pHead(nullptr),
  m_pTail(nullptr)
  {
  }
  
  ~Node()
  {
    RemoveAll();
  }

  Node* ParentNode() 
  {
    return m_pParentNode;
  }

  Node* AddChild(Node* pNode)
  {
    //assert
    pNode->m_pParentNode = this;
    pNode->m_pPrev = m_pTail;
    pNode->m_pNext = nullptr;

    if( m_pTail != NULL )
    {
      m_pTail->m_pNext = pNode;
    }
    else
    {
      m_pHead = pNode;
    }
    m_pTail = pNode;

    return pNode;
  }

  Node* AddChild(const E& value)
  {    
    Node* pNode = new Node(value, this, m_pTail, nullptr);
    return AddChild(pNode);    
  }
  
  void RemoveAt( Node* pOldNode )
  {    
    Node* pParent = pOldNode->m_pParentNode;
    if (pParent != this)
      return;

    if( pOldNode == pParent->m_pHead )
    {
      pParent->m_pHead = pOldNode->m_pNext;
    }
    else
    {
      pOldNode->m_pPrev->m_pNext = pOldNode->m_pNext;
    }
    if( pOldNode == pParent->m_pTail )
    {
      pParent->m_pTail = pOldNode->m_pPrev;
    }
    else
    {
       pOldNode->m_pNext->m_pPrev = pOldNode->m_pPrev;
    }

    delete pOldNode;
  }

  void RemoveAll() 
  {
    while(m_pHead != nullptr)
    {
      Node* pKill = m_pHead;
      m_pHead = m_pHead->m_pNext;
      delete pKill;
    }

    m_pHead = nullptr;
    m_pTail = nullptr;
  }
  
  Node* GetHeadNode() const
  {
    return m_pHead;
  }

  Node* GetNext()
  {
    return m_pNext;
  }

  const E& Data() const
  {
    return m_element;
  } 
  
  void SetData(const E& value)
  {
    m_element = value;
  }    
};


  
template<class T>
void PrintImp(Node<T>& node, int &i)
{
  for (int k = 0; k < i; k++)
      cout << "  ";
  cout << node.Data() << endl;

  Node<T>* pNode = node.GetHeadNode();
  for ( ; pNode != nullptr; pNode = pNode->GetNext())
  {
    i++;
    PrintImp(*pNode, i);
    i--;
  }
}

template<class T>
void Print(Node<T>& node)
{ 
  console::clrscr();
  int i = 0;
  PrintImp(node, i);
  console::getch();
}

}}}