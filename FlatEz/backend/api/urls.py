from django.urls import path
from .views import *

urlpatterns = [

    path('create-flat/', CreateFlatView.as_view(), name='create-flat'),
    path('flatmate-data/', GetFlatMateDataView.as_view(), name='get_flatmate_data'),
    path('joinflat/',JoinFlatView.as_view(),name='joinflat'),
    path('flat-details/',FlatDetailsView.as_view(),name='flat-details'),
    path('leaderboard/', FlatLeaderboardView.as_view(), name='leaderboard'),
    path('submit-score/', SubmitGameScoreView.as_view(), name='submit-score'),
    path('game-leaderboard/', GameLeaderboardView.as_view(), name='game-leaderboard'),
    path('create-chat/', CreateChatMessageView.as_view(), name='create-chat'),
    path('get-chat/', GetChatMessagesView.as_view(), name='get-chat'),
    path('notifications/', UserNotificationView.as_view(), name='user-notifications'),
    path('addtask/', CreateTaskView.as_view(), name='add-task'),
    path('viewtask/', GetAllTasksView.as_view(), name='view-task'),
    path('marktaskasdone/', MarkTaskAsDoneView.as_view(), name='mark-done'),
    path('applyloan/', RequestLoanView.as_view(), name='apply-loan'),
    path('account-data/', AccountDataView.as_view(), name='account-data'),
    path('showloans/', PendingLoansView.as_view(), name='showloans'),
    path('loan-accept/', ProcessLoanTransactionView.as_view(), name='loan-accept'),
    path('loan-reject/', ProcessLoanTransactionView.as_view(), name='loan-reject'), 
    path('loan-history/', LoanHistoryView.as_view(), name='loan-history'),
    path('addexpense/',AddSharedExpenseView.as_view(),name='add-expense'),
    path('viewexpenses/',ViewSharedExpensesView.as_view(),name='view-expense'),
    path('editexpense/<int:id>/', EditSharedExpenseView.as_view(), name='edit-expense'),
    path('payshare/',SharedPaymentView.as_view(),name='pay-share'),
    path('deleteexpense/', DeleteExpenseView.as_view(), name='delete-expense'),
    path('transactions/',UserTransactionsView.as_view(),name='transactions'),
    path('addpartyfund/',AddPartyFundView.as_view(),name='add-party-fund'),
    path('viewpartyfunds/',PartyFundListView.as_view(),name='view-party-fund'),
    path('paypartyfund/',PayPartyFundView.as_view(),name='pay-party-fund'),
    path('markexpensepaid/',PayExpenseView.as_view(),name='pay-expense'),
    path('leaveflat/',LeaveFlatView.as_view(),name='leave-flat'),
    path('user/update/',UpdateFlatMateProfileView.as_view(),name='update-user'),
        
]