package com.example.emmamobileapp.data.retrofit;

import androidx.lifecycle.LiveData;

import com.example.emmamobileapp.data.model.UserModel;

import retrofit2.Call;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface InterfaceUser {
    @GET("/api/user/{userId}")
    Call<LiveData<UserModel>> getUser(@Path("userId") int userId);

    @POST("/api/user/register")
    @FormUrlEncoded
    Call<String> register(@Field("name") String name, @Field("email") String email, @Field("password") String password);

    @POST("/api/user/auth")
    @FormUrlEncoded
    Call<String> auth(@Field("email") String email, @Field("password") String password);
}
