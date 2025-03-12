from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import UserSerializer, TemplateSerializer, TemplateListSerializer, UserListSerializer
from .models import UserStrategy, TemplateStrategy

class isAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff
    
class AddTemplateView(APIView):
    # permission_classes = [isAdmin]
    authentication_classes = []  # public
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        serializer = TemplateSerializer(data=data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": f"Successfully added {len(data)} templates"}, 
                          status=status.HTTP_201_CREATED)
        return Response({"errors": serializer.errors}, 
                      status=status.HTTP_400_BAD_REQUEST)

class AddOrUpdateUserStrategyView(APIView):
    def post(self, request):
        title = request.data.get("title")
        if not title:
            return Response({"error": "Title Required"}, status=status.HTTP_400_BAD_REQUEST)
        
        strategy = None
        try:
            strategy = UserStrategy.objects.get(title=title, author=request.user)
            serializer = UserSerializer(strategy, data=request.data, partial=True)
        except UserStrategy.DoesNotExist:
            serializer = UserSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(author=request.user)
            status_code = status.HTTP_200_OK if strategy else status.HTTP_201_CREATED
            return Response(serializer.data, status=status_code)
        return Response({"message": "Error adding strategy"}, status=status.HTTP_400_BAD_REQUEST)
    
class GetUserStrategiesView(APIView):
    def get(self, request):
        strategies = UserStrategy.objects.filter(author=request.user).order_by('-updated_at')
        serializer = UserListSerializer(strategies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class GetUserStrategyByIdView(APIView):
    def get(self, request, pk):
        try:
            strategy = UserStrategy.objects.get(id=pk, author=request.user)
            # serializer = UserSerializer(strategy)  
            return Response({"code" : strategy.code})
        except UserStrategy.DoesNotExist:
            return Response({"error": "Strategy Doesn't Exist"}, status=status.HTTP_404_NOT_FOUND)
        
class GetTemplateMetadatView(APIView):
    authentication_classes = []  
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        templates = TemplateStrategy.objects.all()
        serializer = TemplateListSerializer(templates, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class GetTemplateStrategyByIdView(APIView):
    authentication_classes = [] 
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            template = TemplateStrategy.objects.get(id=pk)
            return Response({"code" : template.code})
        except TemplateStrategy.DoesNotExist:
            return Response({"error": "Template not found"}, status=status.HTTP_404_NOT_FOUND)
        
class DeleteUserStrategyView(APIView):
    def delete(self, request, pk):
        try:
            strategy = UserStrategy.objects.get(id=pk, author=request.user)
            strategy.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UserStrategy.DoesNotExist:
            return Response({"error": "Strategy not found"}, status=status.HTTP_404_NOT_FOUND)

