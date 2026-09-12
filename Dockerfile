# Multi-stage Dockerfile for RESCUE AI (.NET 10 Web API + Embedded Frontend)

# Stage 1: Build .NET 10 solution
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files first for optimal layer caching
COPY src/Rescue.Domain/Rescue.Domain.csproj src/Rescue.Domain/
COPY src/Rescue.Application/Rescue.Application.csproj src/Rescue.Application/
COPY src/Rescue.Infrastructure/Rescue.Infrastructure.csproj src/Rescue.Infrastructure/
COPY src/Rescue.Sdk/Rescue.Sdk.csproj src/Rescue.Sdk/
COPY src/Rescue.Api/Rescue.Api.csproj src/Rescue.Api/

# Restore dependencies
RUN dotnet restore src/Rescue.Api/Rescue.Api.csproj

# Copy all source code, knowledge corpus, and prebuilt frontend in wwwroot
COPY src/ src/
COPY knowledge/ knowledge/

# Publish Release
WORKDIR /src/src/Rescue.Api
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish ./
COPY knowledge/ ./knowledge/

# Default port configuration (Render and other cloud hosts set PORT dynamically)
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Rescue.Api.dll"]
