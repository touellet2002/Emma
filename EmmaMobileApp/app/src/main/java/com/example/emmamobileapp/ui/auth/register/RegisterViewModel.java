package com.example.emmamobileapp.ui.auth.register;

import android.widget.Toast;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.emmamobileapp.data.model.UserModel;
import com.example.emmamobileapp.data.retrofit.InterfaceUser;
import com.example.emmamobileapp.data.retrofit.RetrofitInstance;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterViewModel extends ViewModel {
    public MutableLiveData<Response> response = new MutableLiveData<>();
    public void register(String name, String email, String password) {
        InterfaceUser interfaceUser = RetrofitInstance.getInstance().create(InterfaceUser.class);
        Call call = interfaceUser.register(name, email, password);

        call.enqueue(new Callback() {
            @Override
            public void onResponse(Call call, Response res) {
                response.setValue(res);
            }

            @Override
            public void onFailure(Call call, Throwable t) {

            }
        });
    }
}
