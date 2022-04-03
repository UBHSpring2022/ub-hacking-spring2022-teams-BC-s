App = {
  web3Provider: null,
  contracts: {},
  names: new Array(),
  url: 'http://127.0.0.1:7545',
  chairPerson:null,
  currentAccount:null,
  init: function() {
    $.getJSON('../proposals.json', function(data) {
      var proposalsRow = $('#proposalsRow');
      var proposalTemplate = $('#proposalTemplate');

      for (i = 0; i < data.length; i ++) {
        proposalTemplate.find('.panel-title').text(data[i].name);
        proposalTemplate.find('img').attr('src', data[i].picture);
        proposalTemplate.find('.btn-vote').attr('data-id', data[i].id);

        proposalsRow.append(proposalTemplate.html());
        App.names.push(data[i].name);
      }
    });
    return App.initWeb3();
  },

  initWeb3: function() {
        // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
    }
    web3 = new Web3(App.web3Provider);

    ethereum.enable();

    App.populateAddress();
    return App.initContract();
  },

  initContract: function() {
      $.getJSON('CDS.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var voteArtifact = data;
    App.contracts.vote = TruffleContract(voteArtifact);

    // Set the provider for our contract
    App.contracts.vote.setProvider(App.web3Provider);
    
    App.getChairperson();
    return App.bindEvents();
  });
  },

  bindEvents: function() {
    $(document).on('click', '.btn-vote', App.handleVote);
    $(document).on('click', '#win-count', App.handleWinner);
    $(document).on('click', '#register', function(){ var ad = $('#ubnumber').val(); App.handleRegister(ad); });
    $(document).on('click', '#feedback', function(){ var fb = $('#rating').val(); App.handleFeedback(fb); });
    $(document).on('click', '#reward', function(){ var rw = $('#enter_address').val(); App.handleReward(rw); });
    $(document).on('click', '#unregister', function(){ var un = $('#enter_address').val(); App.handleUnregister(un); });
    $(document).on('click', '#redeem', function(){ var rd = $('#red').val(); App.handleRedeem(rd); });
    $(document).on('click', '#balance', App.handleBalance);
    $(document).on('click', '#vote_reg', App.handleVoteReg);
    $(document).on('click', '#init', App.handleInitiate);
    $(document).on('click', '#state', App.handleCurrentStatus);
    $(document).on('click', '#state_change', function(){ var stc = $('#stchange').val(); App.handleStateChange(stc); });
    
  },

  populateAddress : function(){
    new Web3(new Web3.providers.HttpProvider(App.url)).eth.getAccounts((err, accounts) => {
      web3.eth.defaultAccount=web3.eth.accounts[0]
      jQuery.each(accounts,function(i){
        if(web3.eth.coinbase != accounts[i]){
          var optionElement = '<option value="'+accounts[i]+'">'+accounts[i]+'</option';
          jQuery('#enter_address').append(optionElement);  
        }
      });
    });
  },

  getChairperson : function(){
    App.contracts.vote.deployed().then(function(instance) {
      return instance;
    }).then(function(result) {
      App.chairPerson = result.constructor.currentProvider.selectedAddress.toString();
      App.currentAccount = web3.eth.coinbase;
      if(App.chairPerson != App.currentAccount){
        jQuery('#address_div').css('display','none');
        jQuery('#register_div').css('display','none');
      }else{
        jQuery('#address_div').css('display','block');
        jQuery('#register_div').css('display','block');
      }
    })
  },

  handleRegister: function(addr){
    var voteInstance;
    web3.eth.getAccounts(function(error, accounts) {
    var account = accounts[0];
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.register(addr, {from: account});
    }).then(function(result, err){
        if(result){
            if(parseInt(result.receipt.status) == 1)
            alert(addr + " registration done successfully")
            else
            alert(addr + " registration not done successfully due to revert")
        } else {
            alert(addr + " registration failed")
        }   
    })
    })
  },

  handleStateChange: function(state){
    var voteInstance;
    web3.eth.getAccounts(function(error, accounts) {
    var account = accounts[0];
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.changeState(state, {from: account});
    }).then(function(result, err){
        if(result){
            if(parseInt(result.receipt.status) == 1)
            alert(state + " change done successfully")
            else
            alert(addr + " registration not done successfully due to revert")
        } else {
            alert(addr + " registration failed")
        }   
    })
    })
  },

  handleVoteReg: function(){
    var voteInstance;
    web3.eth.getAccounts(function(error, accounts) {
    var account = accounts[0];
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.register_for_voting({from: account});
    }).then(function(result, err){
        if(result){
            if(parseInt(result.receipt.status) == 1)
            alert(addr + " voting registration done successfully")
            else
            alert(addr + " registration not done successfully due to revert")
        } else {
            alert(addr + " registration failed")
        }   
    })
    })
  },

  handleInitiate: function(){
    var voteInstance;
    web3.eth.getAccounts(function(error, accounts) {
    var account = accounts[0];
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.Initialte_voting(4,{from: account});
    }).then(function(result, err){
        if(result){
            if(parseInt(result.receipt.status) == 1)
            alert(" initiation done successfully")
            else
            alert(" registration not done successfully due to revert")
        } else {
            alert(" registration failed")
        }   
    })
    })
  },

  handleCurrentStatus: function(){
    var voteInstance;
    web3.eth.getAccounts(function(error, accounts) {
    var account = accounts[0];
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.ShowState({from: account});
    }).then(function(result, err){
        if(result){
          if(result == 0)
            alert("Initiate")
          if(result == 1)
            alert("Register")
          if(result == 2)
            alert("Vote")
          if(result == 3)
            alert("Result Out")
        } else {
            alert(addr + " registration failed")
        }   
    })
    })
  },


  handleBalance: function(){
    var voteInstance;
    web3.eth.getAccounts(function(error, accounts) {
    var account = accounts[0];
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.balanceOf({from: account});
    }).then(function(result, err){
        if(result){
            alert(result + " CFB is your balance")
        } else {
            alert(addr + "  failed")
        }   
    })
    })
},

  handleUnregister: function(addr){
    var voteInstance;
    web3.eth.getAccounts(function(error, accounts) {
    var account = accounts[0];
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.unregister(addr, {from: account});
    }).then(function(result, err){
        if(result){
            if(parseInt(result.receipt.status) == 1)
            alert(addr + " Unregistration done successfully")
            else
            alert(addr + " Unregistration not done successfully due to revert")
        } else {
            alert(addr + " Unregistration failed")
        }   
    })
    })
  },

  handleReward: function(addr){
    var voteInstance;
    web3.eth.getAccounts(function(error, accounts) {
    var account = accounts[0];
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.reward(addr, {from: account});
    }).then(function(result, err){
        if(result){
            if(parseInt(result.receipt.status) == 1)
            alert(addr + " Reward done successfully")
            else
            alert(addr + " Reward not done successfully due to revert")
        } else {
            alert(addr + " Reward failed")
        }   
    })
    })
  },

  handleRedeem: function(item){
    var voteInstance;
    web3.eth.getAccounts(function(error, accounts) {
    var account = accounts[0];
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.redeem(item, {from: account});
    }).then(function(result, err){
        if(result){
            if(parseInt(result.receipt.status) == 1)
            alert(item + " Redeem done successfully")
            else
            alert(item + " Redeem not done successfully due to revert")
        } else {
            alert(item + " Redeem failed")
        }   
    })
    })
  },

  handleFeedback: function(rating){
    var voteInstance;
    web3.eth.getAccounts(function(error, accounts) {
    var account = accounts[0];
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.feedback(rating, {from: account});
    }).then(function(result, err){
        if(result){
            if(parseInt(result.receipt.status) == 1)
            alert(addr + " feedback given successfully")
            else
            alert(addr + " feedback not done successfully due to revert")
        } else {
            alert(addr + " feedback failed")
        }   
    })
    })
  },

  handleVote: function(event) {
    event.preventDefault();
    var proposalId = parseInt($(event.target).data('id'));
    var voteInstance;

    web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0];

      App.contracts.vote.deployed().then(function(instance) {
        voteInstance = instance;

        return voteInstance.Vote(proposalId, {from: account});
      }).then(function(result, err){
            if(result){
                console.log(result.receipt.status);
                if(parseInt(result.receipt.status) == 1)
                alert(account + " voting done successfully")
                else
                alert(account + " voting not done successfully due to revert")
            } else {
                alert(account + " voting failed")
            }   
        });
    });
  },

  

  handleWinner : function() {
    console.log("To get winner");
    var voteInstance;
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.Show_Result();
    }).then(function(res){
    console.log(res);
      alert(App.names[res] + "  is the winner ! :)");
    }).catch(function(err){
      console.log(err.message);
    })
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
