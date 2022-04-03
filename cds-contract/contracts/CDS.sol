pragma solidity >=0.4.22 <=0.6.0;

import "./IERC20.sol";


contract CDS is IERC20 {
    //-----------------------------------------------------------------------------
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;
    //-------------------------------------------------------------------------------
    
    
    address chairperson;
    struct Student {                     
        uint weight;
        bool voted;
        uint vote;
        uint membership;
    }
    
    mapping (address=> Student) students;
    mapping(address => uint)  fb_count;
    mapping(address => uint) fb_time;
    mapping(address => uint) reward_item;
    struct Proposal {                  
        uint voteCount;
    }
    
     Proposal[] proposals;

    enum Phase {Init,Regs, Vote, Done}  
    Phase public state = Phase.Done; 
    
       //modifiers
   modifier validPhase(Phase reqPhase) 
    { require(state == reqPhase); 
      _; 
    } 
    
      modifier onlyChairperson{ 
        require(msg.sender==chairperson);
        _;
    }
    modifier onlyMember{ 
        require(students[msg.sender].membership == 1);
        _;
    }
    
   
    constructor() public {
        _name = 'Campus Feedback';
        _symbol = 'CFB';
        _totalSupply=10000;
        _balances[msg.sender] = _totalSupply;
        
        chairperson = msg.sender;
        students[chairperson].membership = 1;
        state = Phase.Init;
    }

 
    function register (uint id ) public {
        require(id > 100000 && id < 999999, 'Enter a vaild 6 digit ID');
        students[msg.sender].membership = 1;
        fb_count[msg.sender] = 0; 
        fb_time[msg.sender] = block.timestamp - 100;
    }
    
    function unregister (address member ) public onlyMember { 
        students[member].membership = 0;
    }
    

    function feedback(uint rating) public onlyMember {
                                           
        require(block.timestamp > fb_time[msg.sender] + 100);   
        fb_time[msg.sender] = block.timestamp;
        if(rating > 0){
           fb_count[msg.sender]++;
           _approve(chairperson, msg.sender, 20);
           transferFrom(chairperson,msg.sender,10);
        }
    }
    
    function reward(address student) public onlyChairperson payable {
        require(fb_count[student] > 0, 'Student should give a feedback first');
            transfer(student,10);
        
    }
    
    function redeem(uint item) public onlyMember payable {
        require(item > 0 && item < 4,'select any item from 1 - 3');
        if(item == 1){
            transfer(chairperson,20);
            reward_item[msg.sender] = 1; }
        else if(item == 2){
            transfer(chairperson,40);
            reward_item[msg.sender] = 2; }
        else if(item == 3){
            transfer(chairperson,60);
            reward_item[msg.sender] = 3; }
    }
    
    function balanceOf() public view   returns (uint256) {
        return _balances[msg.sender];
    }
    
    function Reward_item() public view returns (uint256) {
        return reward_item[msg.sender];
    }

   

//--------------------Voting-------------------------------------------------------------------------------
     
    function Initialte_voting(uint numProposals) onlyChairperson public {
        
        for (uint prop = 0; prop < numProposals; prop ++)
            proposals.push(Proposal(0));
        state = Phase.Regs;
     }
     
    function changeState(Phase x) onlyChairperson public {
        
        //require (x > state );
        state = x;
     }
     
    function register_for_voting() public validPhase(Phase.Regs) onlyMember {
        students[msg.sender].weight = 1;
    }

   
    function Vote(uint toProposal) public validPhase(Phase.Vote)  {
      
        Student storage sender = students[msg.sender];
        
        require (!sender.voted); 
        require (toProposal < proposals.length); 
        
        sender.voted = true;
        sender.vote = toProposal;   
        proposals[toProposal].voteCount += sender.weight;
    }
   
    function Show_Result() public validPhase(Phase.Done) view returns (uint winningProposal) {
       
        uint winningVoteCount = 0;
        for (uint prop = 0; prop < proposals.length; prop++) 
            if (proposals[prop].voteCount > winningVoteCount) {
                winningVoteCount = proposals[prop].voteCount;
                winningProposal = prop;
            }
       assert(winningVoteCount>=2);
    }

    function ShowState()  public view   returns (Phase)  {
        
        //require (x > state );
        return state ;
     }
   
   
   
   //---------------------------------------------------------------------------------------------
   //                               ERC20 Functions
   //---------------------------------------------------------------------------------------------
    function transfer(address recipient, uint256 amount) internal   returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

   
    function allowance(address owner, address spender) internal view   returns (uint256) {
        return _allowances[owner][spender];
    }

  
    function approve(address spender, uint256 amount) internal   returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) internal   returns (bool) {
        _transfer(sender, recipient, amount);

        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        
            _approve(sender, _msgSender(), currentAllowance - amount);
        

        return true;
    }

   
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal  {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(sender, recipient, amount);

        uint256 senderBalance = _balances[sender];
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
        
            _balances[sender] = senderBalance - amount;
        
        _balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);

        _afterTokenTransfer(sender, recipient, amount);
    }
  
    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal  {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _msgSender() internal view  returns (address) {
        return msg.sender;
    }
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal  {}

   
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal  {}
    
}
