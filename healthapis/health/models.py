from django.db import models



class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
class HoSoSucKhoe(BaseModel):
    chieu_cao= models.FloatField(null=True, blank=True)
    can_nang= models.FloatField(null=True, blank=True)
    tuoi= models.IntegerField(null=True, blank=True)
    gioi_tinh= models.CharField(max_length=10, null=True, blank=True)
    muc_tieu= models.TextField(null=True, blank=True)
class ChiSoHangNgay(BaseModel):
    pass


# Create your models here.
